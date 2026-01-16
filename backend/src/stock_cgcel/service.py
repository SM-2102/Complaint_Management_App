import csv
import io
from datetime import date
from typing import List, Optional

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func

from exceptions import SpareNotFound, StockNotAvailable
from stock_cgcel.models import StockCGCEL, StockCGCELIndent, StockCGCELMovement
from stock_cgcel.schemas import (
    StockCGCELEnquiry,
    StockCGCELEnquiryStockList,
    StockCGCELGenerateIndentRecord,
    StockCGCELGenerateIndentResponse,
    StockCGCELIndentCreate,
    StockCGCELIndentEnquiry,
    StockCGCELSchema,
    StockCGCELUpdate,
)
from utils.date_utils import format_date_ddmmyyyy


class StockCGCELService:
    async def upload_stock_cgcel(self, session: AsyncSession, file: UploadFile):
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

        raw_rows = []
        line_no = 1

        # -------------------------
        # Step 1: Normalize rows
        # -------------------------
        for raw_row in reader:
            line_no += 1

            row = {}
            for k, v in raw_row.items():
                key = (k or "").strip().lower()
                val = v.strip() if v else ""
                row[key] = val if val != "" else None

            if not row.get("spare_code"):
                return {
                    "message": "Invalid CSV",
                    "resolution": f"Missing spare_code at line {line_no}",
                    "type": "warning",
                }

            raw_rows.append(row)

        if not raw_rows:
            return {
                "message": "Uploaded Successfully",
                "resolution": "No valid rows found",
                "type": "success",
            }

        # -------------------------
        # Step 2: Fetch existing spare codes
        # -------------------------
        spare_codes = [r["spare_code"] for r in raw_rows]

        result = await session.execute(
            select(StockCGCEL.spare_code).where(StockCGCEL.spare_code.in_(spare_codes))
        )
        existing_codes = set(result.scalars().all())

        # -------------------------
        # Step 3: Parse + validate rows
        # -------------------------
        records = []

        int_fields = {"cnf_qty", "grc_qty", "own_qty", "indent_qty"}
        float_fields = {
            "alp", "sale_price",
        }

        for row in raw_rows:
            spare_code = row.get("spare_code")
            is_new = spare_code not in existing_codes

            division = row.get("division")
            spare_description = row.get("spare_description")
            hsn_code = row.get("hsn_code")

            # Enforce mandatory fields ONLY for inserts
            if is_new:
                if not division or not spare_description or not hsn_code:
                    return {
                        "message": f"Missing mandatory fields for {spare_code}",
                        "resolution": "Division, Description and HSN Code",
                        "type": "warning",
                    }

            parsed = {
                "spare_code": spare_code,
                "division": division.upper() if division else None,
                "spare_description": (
                    spare_description.upper() if spare_description else None
                ),
                "hsn_code": hsn_code.upper() if hsn_code else None,
            }

            for field in int_fields:
                if field in row:
                    try:
                        parsed[field] = (
                            int(row[field]) if row[field] is not None else None
                        )
                    except Exception:
                        parsed[field] = None

            for field in float_fields:
                if field in row:
                    try:
                        parsed[field] = (
                            float(row[field]) if row[field] is not None else None
                        )
                    except Exception:
                        parsed[field] = None

            try:
                validated = StockCGCELSchema(**parsed)
            except ValidationError as ve:
                return {
                    "message": f"Validation failed for spare_code {spare_code}",
                    "resolution": str(ve),
                    "type": "warning",
                }

            records.append((validated, is_new))

        # -------------------------
        # Step 4: Determine present fields
        # -------------------------
        present_fields = set()
        for r, _ in records:
            present_fields.update(r.dict(exclude_unset=True).keys())

        present_fields.discard("spare_code")

        # -------------------------
        # Step 5: Split INSERT / UPDATE payloads
        # -------------------------
        to_insert = []
        to_update = {}

        for r, is_new in records:
            data = {
                k: v
                for k, v in r.dict(exclude_unset=True).items()
                if k == "spare_code" or k in present_fields
            }

            if is_new:
                to_insert.append(data)
            else:
                # Strip master fields for UPDATE
                data.pop("division", None)
                data.pop("spare_description", None)
                data.pop("hsn_code", None)
                to_update[r.spare_code] = data

        inserted = 0
        updated = 0

        table = StockCGCEL.__table__

        # -------------------------
        # Step 6: Zero numeric columns present in CSV
        # -------------------------
        numeric_fields = int_fields | float_fields
        zero_fields = present_fields & numeric_fields

        if zero_fields:
            await session.execute(update(table).values({f: 0 for f in zero_fields}))

        # -------------------------
        # Step 7: Bulk INSERT / UPDATE
        # -------------------------
        try:
            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

            if to_update:
                update_fields = present_fields - {"division", "spare_description", "hsn_code"}

                values_dict = {}
                for field in update_fields:
                    values_dict[field] = case(
                        {k: v.get(field) for k, v in to_update.items() if field in v},
                        value=table.c.spare_code,
                    )

                stmt = (
                    update(table)
                    .where(table.c.spare_code.in_(to_update.keys()))
                    .values(**values_dict)
                )

                await session.execute(stmt)
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

    def _apply_stock_cgcel_filters(
        self,
        statement,
        spare_description=None,
        spare_code=None,
        division=None,
        cnf=None,
        grc=None,
        own=None,
        model=StockCGCEL,
    ):
        if spare_description:
            statement = statement.where(
                model.spare_description.ilike(f"{spare_description}")
            )
        if division:
            statement = statement.where(model.division == division)
        if spare_code:
            statement = statement.where(model.spare_code.ilike(f"{spare_code}"))
        if cnf:
            if cnf == "Y":
                statement = statement.where(
                    (model.cnf_qty.isnot(None) & (model.cnf_qty > 0))
                )
            else:
                statement = statement.where(
                    (model.cnf_qty.is_(None) | (model.cnf_qty == 0))
                )
        if grc:
            if grc == "Y":
                statement = statement.where(
                    (model.grc_qty.isnot(None) & (model.grc_qty > 0))
                )
            else:
                statement = statement.where(
                    (model.grc_qty.is_(None) | (model.grc_qty == 0))
                )
        if own:
            if own == "Y":
                statement = statement.where(
                    (model.own_qty.isnot(None) & (model.own_qty > 0))
                )
            else:
                statement = statement.where(
                    (model.own_qty.is_(None) | (model.own_qty == 0))
                )
        return statement

    async def enquiry_stock_cgcel(
        self,
        session: AsyncSession,
        spare_description: Optional[str] = None,
        spare_code: Optional[str] = None,
        division: Optional[str] = None,
        cnf: Optional[str] = None,
        grc: Optional[str] = None,
        own: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        return_total: bool = False,
    ):
        statement = select(StockCGCEL)
        statement = self._apply_stock_cgcel_filters(
            statement, spare_description, spare_code, division, cnf, grc, own
        )

        total_records = None
        if return_total:
            count_query = select(func.count()).select_from(StockCGCEL)
            count_query = self._apply_stock_cgcel_filters(
                count_query,
                spare_description,
                spare_code,
                division,
                cnf,
                grc,
                own,
                StockCGCEL,
            )
            total_result = await session.execute(count_query)
            total_records = total_result.scalar() or 0

        statement = statement.order_by(StockCGCEL.spare_code)
        statement = statement.limit(limit).offset(offset)

        result = await session.execute(statement)
        rows = result.all()
        records = [
            StockCGCELEnquiry(
                spare_code=row.StockCGCEL.spare_code,
                division=row.StockCGCEL.division,
                spare_description=row.StockCGCEL.spare_description,
                cnf_qty=row.StockCGCEL.cnf_qty,
                grc_qty=row.StockCGCEL.grc_qty,
                own_qty=row.StockCGCEL.own_qty,
                alp=row.StockCGCEL.alp,
                sale_price=row.StockCGCEL.sale_price,
            )
            for row in rows
        ]

        if return_total:
            return records, total_records
        return records

    async def list_cgcel_stock(self, session: AsyncSession):
        statement = select(
            StockCGCEL.spare_code, StockCGCEL.spare_description
        ).order_by(StockCGCEL.spare_code)
        result = await session.execute(statement)
        rows = result.all()
        return [
            StockCGCELEnquiryStockList(
                spare_code=row.spare_code,
                spare_description=row.spare_description,
            )
            for row in rows
        ]

    async def list_cgcel_stock_by_division(self, session: AsyncSession, division: str):
        statement = (
            select(StockCGCEL.spare_code, StockCGCEL.spare_description)
            .where(StockCGCEL.division == division)
            .order_by(StockCGCEL.spare_code)
        )
        result = await session.execute(statement)
        rows = result.all()
        return [
            StockCGCELEnquiryStockList(
                spare_code=row.spare_code,
                spare_description=row.spare_description,
            )
            for row in rows
        ]

    async def get_stock_cgcel_by_code(self, spare_code: str, session: AsyncSession):
        statement = select(StockCGCEL).where(StockCGCEL.spare_code == spare_code)
        result = await session.execute(statement)
        spare = result.scalars().first()
        if spare:
            return spare
        else:
            raise SpareNotFound()

    async def get_stock_cgcel_by_name(
        self, spare_description: str, session: AsyncSession
    ):
        statement = select(StockCGCEL).where(
            StockCGCEL.spare_description == spare_description
        )
        result = await session.execute(statement)
        spare = result.scalars().first()
        if spare:
            return spare
        else:
            raise SpareNotFound()

    async def create_indent_cgcel(
        self, spare_code: str, indentData: StockCGCELIndentCreate, session: AsyncSession
    ):
        existing_record = await self.get_stock_cgcel_by_code(spare_code, session)
        for key, value in indentData.model_dump().items():
            setattr(existing_record, key, value)
        try:
            await session.commit()
        except:
            await session.rollback()
        await session.refresh(existing_record)
        return existing_record

    async def update_cgcel_stock(
        self, updateData: StockCGCELUpdate, session: AsyncSession, token: dict
    ):
        existing_record = await self.get_stock_cgcel_by_code(
            updateData.spare_code, session
        )
        movement = StockCGCELMovement(
            spare_code=updateData.spare_code,
            division=updateData.division,
            spare_description=updateData.spare_description,
            movement_type=updateData.movement_type,
            own_qty=updateData.own_qty,
            remark=updateData.remark,
        )
        movement.created_by = token["user"]["username"]
        movement.entry_date = date.today()
        session.add(movement)
        if updateData.movement_type == "SPARE IN":
            existing_record.own_qty = (
                existing_record.own_qty or 0
            ) + updateData.own_qty
        elif updateData.movement_type == "SPARE OUT":
            existing_record.own_qty = (existing_record.own_qty) - updateData.own_qty
        session.add(existing_record)
        try:
            await session.commit()
        except:
            await session.rollback()
        await session.refresh(existing_record)
        return existing_record

    async def get_cgcel_indent_details_by_division(
        self, division: str, session: AsyncSession
    ):
        statement = select(StockCGCEL).where(
            StockCGCEL.division == division,
            StockCGCEL.indent_qty.isnot(None),
            StockCGCEL.indent_qty > 0,
        )
        result = await session.execute(statement)
        rows = result.all()
        indent_details = [
            StockCGCELGenerateIndentResponse(
                spare_code=row.StockCGCEL.spare_code,
                spare_description=row.StockCGCEL.spare_description,
                indent_qty=row.StockCGCEL.indent_qty,
            )
            for row in rows
        ]
        return indent_details

    async def next_cgcel_indent_code(self, session: AsyncSession):
        statement = (
            select(StockCGCELIndent.indent_number)
            .order_by(StockCGCELIndent.indent_number.desc())
            .limit(1)
        )
        result = await session.execute(statement)
        last_code = result.scalar()
        last_number = str(last_code)[1:] if last_code else "0"
        next_number = int(last_number) + 1
        next_indent_number = "I" + str(next_number).zfill(5)
        return next_indent_number

    async def generate_cgcel_indent(
        self,
        indentData: StockCGCELGenerateIndentRecord,
        session: AsyncSession,
        token: dict,
    ):
        indent_records = []
        for spare_code in indentData.spare_code:
            existing_record = await self.get_stock_cgcel_by_code(spare_code, session)
            if existing_record.indent_qty is None or existing_record.indent_qty <= 0:
                raise StockNotAvailable()

            indent_record = StockCGCELIndent(
                spare_code=existing_record.spare_code,
                division=indentData.division,
                spare_description=existing_record.spare_description,
                indent_qty=existing_record.indent_qty,
                indent_number=indentData.indent_number,
                party_name=existing_record.party_name,
                order_number=existing_record.order_number,
                order_date=existing_record.order_date,
                remark=existing_record.remark,
            )
            indent_record.created_by = token["user"]["username"]
            indent_record.indent_date = date.today()
            session.add(indent_record)
            indent_records.append(indent_record)

        # Set indent_qty = 0 for all StockCGCEL records in the given division
        await session.execute(
            update(StockCGCEL)
            .where(StockCGCEL.division == indentData.division)
            .values(indent_qty=0)
        )
        try:
            await session.commit()
        except Exception:
            await session.rollback()
        return indent_records

    def _apply_indent_cgcel_filters(
        self,
        statement,
        spare_description=None,
        spare_code=None,
        division=None,
        from_indent_date=None,
        to_indent_date=None,
        from_indent_number=None,
        to_indent_number=None,
        model=StockCGCELIndent,
    ):
        if spare_description:
            statement = statement.where(
                StockCGCELIndent.spare_description.ilike(f"{spare_description}")
            )

        if division:
            statement = statement.where(StockCGCELIndent.division == division)

        if spare_code:
            statement = statement.where(
                StockCGCELIndent.spare_code.ilike(f"{spare_code}")
            )

        if from_indent_date:
            statement = statement.where(
                StockCGCELIndent.indent_date >= from_indent_date
            )

        if to_indent_date:
            statement = statement.where(StockCGCELIndent.indent_date <= to_indent_date)

        if from_indent_number:
            if len(from_indent_number) != 6:
                from_indent_number = "I" + str(from_indent_number).zfill(5)
            statement = statement.where(
                StockCGCELIndent.indent_number >= from_indent_number
            )

        if to_indent_number:
            if len(to_indent_number) != 6:
                to_indent_number = "I" + str(to_indent_number).zfill(5)
            statement = statement.where(
                StockCGCELIndent.indent_number <= to_indent_number
            )

        return statement

    async def enquiry_indent_cgcel(
        self,
        session: AsyncSession,
        spare_description: Optional[str] = None,
        spare_code: Optional[str] = None,
        division: Optional[str] = None,
        from_indent_date: Optional[date] = None,
        to_indent_date: Optional[date] = None,
        from_indent_number: Optional[str] = None,
        to_indent_number: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        return_total: bool = False,
    ):
        statement = select(StockCGCELIndent)
        statement = self._apply_indent_cgcel_filters(
            statement,
            spare_description,
            spare_code,
            division,
            from_indent_date,
            to_indent_date,
            from_indent_number,
            to_indent_number,
        )

        total_records = None
        if return_total:
            count_query = select(func.count()).select_from(StockCGCELIndent)
            count_query = self._apply_indent_cgcel_filters(
                count_query,
                spare_description,
                spare_code,
                division,
                from_indent_date,
                to_indent_date,
                from_indent_number,
                to_indent_number,
                StockCGCELIndent,
            )
            total_result = await session.execute(count_query)
            total_records = total_result.scalar() or 0

        statement = statement.order_by(StockCGCELIndent.spare_code)
        statement = statement.limit(limit).offset(offset)

        result = await session.execute(statement)
        rows = result.all()
        records = [
            StockCGCELIndentEnquiry(
                spare_code=row.StockCGCELIndent.spare_code,
                division=row.StockCGCELIndent.division,
                spare_description=row.StockCGCELIndent.spare_description,
                indent_qty=row.StockCGCELIndent.indent_qty,
                indent_number=row.StockCGCELIndent.indent_number,
                indent_date=format_date_ddmmyyyy(row.StockCGCELIndent.indent_date),
                party_name=row.StockCGCELIndent.party_name,
                created_by=row.StockCGCELIndent.created_by,
            )
            for row in rows
        ]
        if return_total:
            return records, total_records
        return records
