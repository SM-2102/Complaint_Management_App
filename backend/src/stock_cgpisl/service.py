import csv
import io

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from stock_cgpisl.models import StockCGPISL
from stock_cgpisl.schemas import StockCGPISLSchema, StockCGPISLEnquiry, StockCGPISLEnquiryStockList
from typing import Optional

class StockCGPISLService:

    async def upload_stock_cgpisl(self, session: AsyncSession, file: UploadFile):
        content = await file.read()
        try:
            text = content.decode("utf-8-sig")
        except Exception:
            text = content.decode("utf-8", errors="ignore")

        reader = csv.DictReader(io.StringIO(text))

        if not reader.fieldnames:
            return {
                "message": "Invalid file",
                "resolution": "CSV file has no headers",
                "type": "warning",
            }

        records = []
        line_no = 1


        for raw_row in reader:
            line_no += 1

            # Define which fields are numeric
            int_fields = {"cnf_qty", "grc_qty", "own_qty", "msl_qty", "indent_qty"}
            float_fields = {"alp", "purchase_price", "discount", "sale_price", "gst_price", "gst_rate"}
            row = {}
            for k, v in raw_row.items():
                key = (k or "").strip().lower()
                val = v.strip() if v else ""
                if key in int_fields:
                    row[key] = int(val) if val != "" else None
                elif key in float_fields:
                    try:
                        row[key] = float(val) if val != "" else None
                    except Exception:
                        row[key] = None
                else:
                    row[key] = val.upper() if val != "" else None

            spare_code = row.get("spare_code")
            division = row.get("division")
            spare_description = row.get("spare_description")

            # Optional fields
            optional_fields = [
                "cnf_qty","grc_qty", "own_qty", "alp", "purchase_price", "discount", "sale_price", "gst_price", "gst_rate", "msl_qty", "indent_qty"
            ]
            extra_data = {}
            for field in optional_fields:
                value = row.get(field)
                if value is not None:
                    # Try to convert to int or float if appropriate
                    if field in ["cnf_qty", "grc_qty", "own_qty", "msl_qty", "indent_qty"]:
                        try:
                            extra_data[field] = int(value)
                        except Exception:
                            extra_data[field] = None
                    elif field in ["alp", "purchase_price", "discount", "sale_price", "gst_price", "gst_rate"]:
                        try:
                            extra_data[field] = float(value)
                        except Exception:
                            extra_data[field] = None
                    else:
                        extra_data[field] = value

            try:
                validated = StockCGPISLSchema(
                    spare_code=spare_code,
                    division=division,
                    spare_description=spare_description,
                    **{k: v for k, v in extra_data.items() if v is not None}
                )
            except ValidationError as ve:
                return {
                    "message": f"Validation failed for {spare_code}",
                    "resolution": str(ve),
                    "type": "warning",
                }

            records.append(validated)

        if not records:
            return {
                "message": "Uploaded Successfully",
                "resolution": "No valid rows found",
            }

        keys = [r.spare_code for r in records]

        result = await session.execute(
            select(StockCGPISL).where(StockCGPISL.spare_code.in_(keys))
        )

        existing = {r.spare_code: r for r in result.scalars().all()}

        to_insert = []
        to_update = {}


        # Determine which columns are present in the CSV (excluding spare_code)
        present_fields = set()
        for r in records:
            present_fields.update(r.dict(exclude_unset=True).keys())
        present_fields.discard("spare_code")

        for r in records:
            # Only include fields present in the CSV (plus spare_code)
            data_dict = {k: v for k, v in r.dict(exclude_unset=False).items() if k == "spare_code" or k in present_fields}
            if r.spare_code in existing:
                to_update[r.spare_code] = data_dict
            else:
                to_insert.append(data_dict)

        inserted = 0
        updated = 0

        table = StockCGPISL.__table__


        # Set only numeric columns being updated to 0 before insert/update
        numeric_fields = {"cnf_qty", "grc_qty", "own_qty", "alp", "purchase_price", "discount", "sale_price", "gst_price", "gst_rate", "msl_qty", "indent_qty"}
        zero_fields = set()
        for r in records:
            zero_fields.update(r.dict(exclude_unset=True).keys())
        zero_fields = zero_fields & numeric_fields
        if zero_fields:
            await session.execute(update(table).values({field: 0 for field in zero_fields}))


        try:
            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

            if to_update:
                # Only update fields present in the CSV (excluding spare_code)
                update_fields = present_fields.copy()

                values_dict = {}
                for field in update_fields:
                    # Only provide a mapping for keys that have this field
                    values_dict[field] = case(
                        {k: v.get(field) for k, v in to_update.items() if field in v},
                        value=table.c.spare_code,
                    )

                statement = (
                    update(table)
                    .where(table.c.spare_code.in_(to_update.keys()))
                    .values(**values_dict)
                )
                await session.execute(statement)
                updated = len(to_update)

            await session.commit()

        except IntegrityError as e:
            await session.rollback()
            return {
                "message": "Database integrity error",
                "resolution": str(e),
                "type": "error",
            }
        except Exception as e:
            await session.rollback()
            import traceback

            traceback.print_exc()
            return {
                "message": "Unexpected server error",
                "resolution": str(e),
                "type": "error",
            }

        return {
            "message": "Spare Code Uploaded",
            "resolution": f"Inserted : {inserted}, Updated : {updated}",
            "type": "success",
        }
    
    async def enquiry_stock_cgpisl(
        self,
        session: AsyncSession,
        spare_description: Optional[str] = None,
        spare_code: Optional[str] = None,
        division: Optional[str] = None,
        available: Optional[str] = None,
    ):

        statement = select(StockCGPISL)

        if spare_description:
            statement = statement.where(StockCGPISL.spare_description.ilike(f"{spare_description}"))

        if division:
            statement = statement.where(StockCGPISL.division == division)

        if spare_code:
            statement = statement.where(StockCGPISL.spare_code.ilike(f"{spare_code}"))

        if available:
            if available == "Y":
                statement = statement.where((StockCGPISL.cnf_qty.isnot(None) & (StockCGPISL.cnf_qty > 0)) |
                                            (StockCGPISL.grc_qty.isnot(None) & (StockCGPISL.grc_qty > 0)) |
                                            (StockCGPISL.own_qty.isnot(None) & (StockCGPISL.own_qty > 0)) )
            else:
                statement = statement.where((StockCGPISL.cnf_qty.is_(None) | (StockCGPISL.cnf_qty == 0)) &
                                            (StockCGPISL.grc_qty.is_(None) | (StockCGPISL.grc_qty == 0)) &
                                            (StockCGPISL.own_qty.is_(None) | (StockCGPISL.own_qty == 0)) )
       
        statement = statement.order_by(StockCGPISL.spare_code)

        result = await session.execute(statement)
        rows = result.all()

        return [
            StockCGPISLEnquiry(
                spare_code=row.StockCGPISL.spare_code,
                division=row.StockCGPISL.division,
                spare_description=row.StockCGPISL.spare_description,
                cnf_qty=row.StockCGPISL.cnf_qty,
                grc_qty=row.StockCGPISL.grc_qty,
                own_qty=row.StockCGPISL.own_qty,
                sale_price=row.StockCGPISL.sale_price,
            )
            for row in rows
        ]

    async def list_cgpisl_stock(self, session: AsyncSession):
        statement = (
            select(StockCGPISL.spare_code, StockCGPISL.spare_description)
            .order_by(StockCGPISL.spare_code)
        )
        result = await session.execute(statement)
        rows = result.all()
        return [
            StockCGPISLEnquiryStockList(
                spare_code=row.spare_code,
                spare_description=row.spare_description,
            )
            for row in rows
        ]
