import csv
import io

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from stock_cgpisl.models import StockCGPISL, StockCGPISLIndent
from stock_cgpisl.schemas import StockCGPISLGenerateIndentResponse, StockCGPISLSchema, StockCGPISLEnquiry, StockCGPISLEnquiryStockList, StockCGPISLIndentCreate, StockCGPISLGenerateIndentRecord, StockCGPISLIndentEnquiry
from typing import Optional
from exceptions import SpareNotFound, StockNotAvailable
from datetime import date

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

    async def list_cgpisl_stock_by_division(self, session: AsyncSession, division: str):
        statement = (
            select(StockCGPISL.spare_code, StockCGPISL.spare_description)
            .where(StockCGPISL.division == division)
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

    async def get_stock_cgpisl_by_code(self, spare_code: str, session: AsyncSession):
        statement = select(StockCGPISL).where(StockCGPISL.spare_code == spare_code)
        result = await session.execute(statement)
        spare = result.scalars().first()
        if spare:
            return spare
        else:
            raise SpareNotFound()

    async def get_stock_cgpisl_by_name(self, spare_description: str, session: AsyncSession):
        statement = select(StockCGPISL).where(StockCGPISL.spare_description == spare_description)
        result = await session.execute(statement)
        spare = result.scalars().first()
        if spare:
            return spare
        else:
            raise SpareNotFound() 
        
    async def create_indent_cgpisl(
        self, spare_code: str, indentData: StockCGPISLIndentCreate, session: AsyncSession
    ):
        existing_record = await self.get_stock_cgpisl_by_code(spare_code, session)
        for key, value in indentData.model_dump().items():
            setattr(existing_record, key, value)
        try:
            await session.commit()
        except:
            await session.rollback()
        await session.refresh(existing_record)
        return existing_record
    
    async def get_cgpisl_indent_details_by_division(self, division: str, session: AsyncSession):
        statement = select(StockCGPISL).where(StockCGPISL.division == division, StockCGPISL.indent_qty.isnot(None), StockCGPISL.indent_qty > 0)
        result = await session.execute(statement)
        rows = result.all()
        indent_details = [
            StockCGPISLGenerateIndentResponse(
                spare_code=row.StockCGPISL.spare_code,
                spare_description=row.StockCGPISL.spare_description,
                indent_qty=row.StockCGPISL.indent_qty,
            )
            for row in rows
        ]
        return indent_details
    
    async def next_cgpisl_indent_code(self, session: AsyncSession):
        statement = select(StockCGPISLIndent.indent_number).order_by(StockCGPISLIndent.indent_number.desc()).limit(1)
        result = await session.execute(statement)
        last_code = result.scalar()
        last_number = str(last_code)[1:] if last_code else '0'
        next_number = int(last_number) + 1
        next_indent_number = "I" + str(next_number).zfill(5)
        return next_indent_number
    
    
    async def generate_cgpisl_indent(self, indentData: StockCGPISLGenerateIndentRecord, session: AsyncSession, token: dict):
        indent_records = []
        for spare_code in indentData.spare_code:
            existing_record = await self.get_stock_cgpisl_by_code(spare_code, session)
            if existing_record.indent_qty is None or existing_record.indent_qty <= 0:
                raise StockNotAvailable()

            indent_record = StockCGPISLIndent(
                spare_code=existing_record.spare_code,
                division=indentData.division,
                spare_description=existing_record.spare_description,
                indent_qty=existing_record.indent_qty,
                indent_number=indentData.indent_number,
                party_name=existing_record.party_name,
                order_number=existing_record.order_number,
                order_date=existing_record.order_date,
                remark=existing_record.remark
            )
            indent_record.created_by = token["user"]["username"]
            indent_record.indent_date = date.today()
            session.add(indent_record)
            indent_records.append(indent_record)

        # Set indent_qty = 0 for all StockCGPISL records in the given division
        await session.execute(
            update(StockCGPISL)
            .where(StockCGPISL.division == indentData.division)
            .values(indent_qty=0)
        )
        try:
            await session.commit()
        except Exception:
            await session.rollback()
        return indent_records
    
    async def enquiry_indent_cgpisl(
        self,
        session: AsyncSession,
        spare_description: Optional[str] = None,
        spare_code: Optional[str] = None,
        division: Optional[str] = None,
        from_indent_date: Optional[date] = None,
        to_indent_date: Optional[date] = None,
        from_indent_number: Optional[str] = None,
        to_indent_number: Optional[str] = None,
    ):

        statement = select(StockCGPISLIndent)

        if spare_description:
            statement = statement.where(StockCGPISLIndent.spare_description.ilike(f"{spare_description}"))

        if division:
            statement = statement.where(StockCGPISLIndent.division == division)

        if spare_code:
            statement = statement.where(StockCGPISLIndent.spare_code.ilike(f"{spare_code}"))

        if from_indent_date:
            statement = statement.where(StockCGPISLIndent.indent_date >= from_indent_date)

        if to_indent_date:
            statement = statement.where(StockCGPISLIndent.indent_date <= to_indent_date)

        if from_indent_number:
            statement = statement.where(StockCGPISLIndent.indent_number >= from_indent_number)

        if to_indent_number:
            statement = statement.where(StockCGPISLIndent.indent_number <= to_indent_number)

        statement = statement.order_by(StockCGPISLIndent.spare_code)

        result = await session.execute(statement)
        rows = result.scalars().all()
        if rows:
            return [
                StockCGPISLIndentEnquiry(
                    spare_code=row.spare_code,
                    division=row.division,
                    spare_description=row.spare_description,
                    indent_qty=row.indent_qty,
                    indent_number=row.indent_number,
                    indent_date=row.indent_date,
                    party_name=row.party_name,
                )
                for row in rows
            ]