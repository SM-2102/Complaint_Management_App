import csv
import io
import os
from datetime import date
from typing import List, Optional

from fastapi import UploadFile
from pydantic import ValidationError
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from sqlalchemy import case, insert, tuple_, update, select, distinct
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from exceptions import SpareNotFound
from grc_cgcel.models import GRCCGCEL, GRCCGCELDispute, GRCCGCELReturnHistory
from grc_cgcel.schemas import (
    GRCCGCELDisputeCreate,
    GRCCGCELHistorySchema,
    GRCCGCELReceiveSchema,
    GRCCGCELReturnFinalizePayload,
    GRCCGCELReturnSave,
    GRCCGCELReturnSchema,
    GRCCGCELSchema,
    GRCCGCELUpdateReceiveSchema,
    GRCFullPayload,
    GRCCGCELEnquiry,
)
from utils.date_utils import format_date_ddmmyyyy
from utils.file_utils import safe_join


class GRCCGCELService:
    async def upload_grc_cgcel(self, session: AsyncSession, file: UploadFile):
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
            int_fields = {"grc_number", "grc_pending_qty", "issue_qty"}
            row = {}
            for k, v in raw_row.items():
                key = (k or "").strip().lower()
                val = v.strip() if v else ""
                if key in int_fields:
                    row[key] = int(val) if val != "" else None
                else:
                    row[key] = val.upper() if val != "" else None

            spare_code = row.get("spare_code")
            division = row.get("division")
            spare_description = row.get("spare_description")
            grc_number = row.get("grc_number")
            grc_date = row.get("grc_date")
            issue_qty = row.get("issue_qty")
            grc_pending_qty = row.get("grc_pending_qty")

            try:
                validated = GRCCGCELSchema(
                    spare_code=spare_code,
                    division=division,
                    spare_description=spare_description,
                    grc_number=grc_number,
                    grc_date=grc_date,
                    issue_qty=issue_qty,
                    grc_pending_qty=grc_pending_qty,
                    status="N",
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

        # Use (spare_code, grc_number) as composite key
        from sqlalchemy import tuple_

        keys = [(r.spare_code, r.grc_number) for r in records]

        result = await session.execute(
            select(GRCCGCEL).where(
                tuple_(GRCCGCEL.spare_code, GRCCGCEL.grc_number).in_(keys)
            )
        )
        existing = {(r.spare_code, r.grc_number): r for r in result.scalars().all()}

        to_insert = []
        to_update = {}

        # Determine which columns are present in the CSV (excluding spare_code and grc_number)
        present_fields = set()
        for r in records:
            present_fields.update(r.dict(exclude_unset=True).keys())
        present_fields.discard("spare_code")
        present_fields.discard("grc_number")

        for r in records:
            # Only include fields present in the CSV (plus spare_code, grc_number), and set status='N'
            data_dict = {
                k: v
                for k, v in r.dict(exclude_unset=False).items()
                if k in ("spare_code", "grc_number") or k in present_fields
            }
            data_dict["status"] = "N"
            key = (r.spare_code, r.grc_number)
            if key in existing:
                to_update[key] = data_dict
            else:
                to_insert.append(data_dict)

        inserted = 0
        updated = 0

        table = GRCCGCEL.__table__

        try:
            await session.execute(update(table).values(status="Y"))

            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

            if to_update:
                # Only update fields present in the CSV (excluding spare_code, grc_number)
                update_fields = present_fields.copy()
                update_fields.add("status")
                for key, values in to_update.items():
                    stmt = (
                        update(table)
                        .where(
                            (table.c.spare_code == key[0])
                            & (table.c.grc_number == key[1])
                        )
                        .values(
                            **{
                                field: values[field]
                                for field in update_fields
                                if field in values
                            }
                        )
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

    async def not_received_grc_numbers(self, session: AsyncSession):
        statement = (
            select(GRCCGCEL.grc_number)
            .where(
                GRCCGCEL.receive_date.is_(None),
            )
            .distinct()
        )
        result = await session.execute(statement)
        rows = result.scalars().all()
        return rows

    async def not_received_by_grc_number(self, grc_number: int, session: AsyncSession):
        statement = select(GRCCGCEL).where(
            GRCCGCEL.grc_number == grc_number,
            GRCCGCEL.receive_date.is_(None),
        )
        result = await session.execute(statement)
        rows = result.scalars().all()
        return [
            GRCCGCELReceiveSchema(
                spare_code=row.spare_code,
                division=row.division,
                spare_description=row.spare_description,
                issue_qty=row.issue_qty,
                receive_qty=row.receive_qty,
                damaged_qty=row.damaged_qty,
                short_qty=row.short_qty,
                alt_spare_qty=row.alt_spare_qty,
                alt_spare_code=row.alt_spare_code,
                dispute_remark=row.dispute_remark,
            )
            for row in rows
        ]

    async def update_cgcel_grc_receive(
        self, updateData: List[GRCCGCELUpdateReceiveSchema], session: AsyncSession
    ):
        for data in updateData:
            existing_record = await self.get_grc_cgcel_by_code(
                data.spare_code, data.grc_number, session
            )
            for key, value in data.model_dump().items():
                if key not in ("spare_code", "grc_number") and value is not None:
                    setattr(existing_record, key, value)
            existing_record.receive_date = date.today()
            session.add(existing_record)

            # If issue_qty != receive_qty, add to GRCCGCELDispute
            if getattr(data, "issue_qty", None) != getattr(data, "receive_qty", None):

                dispute_data = GRCCGCELDisputeCreate(
                    spare_code=data.spare_code,
                    division=getattr(
                        data, "division", getattr(existing_record, "division", None)
                    ),
                    grc_number=data.grc_number,
                    grc_date=getattr(existing_record, "grc_date", None),
                    spare_description=getattr(
                        data,
                        "spare_description",
                        getattr(existing_record, "spare_description", None),
                    ),
                    issue_qty=getattr(existing_record, "issue_qty", None),
                    grc_pending_qty=getattr(
                        data,
                        "grc_pending_qty",
                        getattr(existing_record, "grc_pending_qty", None),
                    ),
                    damaged_qty=getattr(data, "damaged_qty", None),
                    short_qty=getattr(data, "short_qty", None),
                    alt_spare_qty=getattr(data, "alt_spare_qty", None),
                    alt_spare_code=getattr(data, "alt_spare_code", None),
                    dispute_remark=getattr(data, "dispute_remark", None),
                )
                dispute_record = GRCCGCELDispute(**dispute_data.model_dump())
                session.add(dispute_record)
        try:
            await session.commit()
        except:
            await session.rollback()

    async def grc_return_by_division(self, division: str, session: AsyncSession):
        statement = select(GRCCGCEL).where(
            GRCCGCEL.division == division,
            GRCCGCEL.status == "N",
        ).order_by(GRCCGCEL.grc_number)
        result = await session.execute(statement)
        rows = result.all()
        return [
            GRCCGCELReturnSchema(
                grc_number=row.GRCCGCEL.grc_number,
                grc_date=format_date_ddmmyyyy(row.GRCCGCEL.grc_date),
                spare_code=row.GRCCGCEL.spare_code,
                spare_description=row.GRCCGCEL.spare_description,
                issue_qty=row.GRCCGCEL.issue_qty,
                grc_pending_qty=row.GRCCGCEL.grc_pending_qty,
                actual_pending_qty=row.GRCCGCEL.actual_pending_qty,
                returned_qty=row.GRCCGCEL.returned_qty,
                good_qty=row.GRCCGCEL.good_qty,
                defective_qty=row.GRCCGCEL.defective_qty,
                invoice=row.GRCCGCEL.invoice,
                docket_number=row.GRCCGCEL.docket_number,
                sent_through=row.GRCCGCEL.sent_through,
            )
            for row in rows
        ]

    #

    async def get_grc_cgcel_by_code(
        self, spare_code: str, grc_number: int, session: AsyncSession
    ):
        statement = select(GRCCGCEL).where(
            (GRCCGCEL.spare_code == spare_code) & (GRCCGCEL.grc_number == grc_number)
        )
        result = await session.execute(statement)
        spare = result.scalars().first()
        if spare:
            return spare
        else:
            raise SpareNotFound()

    async def save_cgcel_grc_return(
        self,
        updateData: List[GRCCGCELReturnSave],
        session: AsyncSession,
    ):
        keys = [(d.spare_code, d.grc_number) for d in updateData]
        result = await session.execute(
            select(GRCCGCEL).where(
                tuple_(GRCCGCEL.spare_code, GRCCGCEL.grc_number).in_(keys)
            )
        )
        existing_records = {(r.spare_code, r.grc_number): r for r in result.scalars().all()}
        for data in updateData:
            key = (data.spare_code, data.grc_number)
            existing_record = existing_records.get(key)
            if not existing_record:
                continue  # or raise error if required
            for k, v in data.model_dump().items():
                if k not in ("spare_code", "grc_number") and v is not None:
                    setattr(existing_record, k, v)
            # No need to session.add(existing_record) if already loaded
        try:
            await session.commit()
        except Exception:
            await session.rollback()

    async def finalize_cgcel_grc_return(
        self, updateData: GRCCGCELReturnFinalizePayload, session: AsyncSession, token: dict
    ):
        # updateData: GRCCGCELReturnFinalizePayload
        #   - challan_number: str
        #   - division: str
        #   - sent_through: Optional[str]
        #   - docket_number: Optional[str]
        #   - grc_rows: List[GRCCGCELFinalizeRow]
        keys = [(row.spare_code, row.grc_number) for row in updateData.grc_rows]
        result = await session.execute(
            select(GRCCGCEL).where(
                tuple_(GRCCGCEL.spare_code, GRCCGCEL.grc_number).in_(keys)
            )
        )
        existing_records = {(r.spare_code, r.grc_number): r for r in result.scalars().all()}
        history_records = []
        updated_records = []
        for row in updateData.grc_rows:
            key = (row.spare_code, row.grc_number)
            existing_record = existing_records.get(key)
            if not existing_record:
                continue
            good_qty = getattr(row, "good_qty", 0) or 0
            defective_qty = getattr(row, "defective_qty", 0) or 0
            returning_qty = good_qty + defective_qty
            # Always add to history if returning_qty > 0
            if returning_qty > 0:
                history_kwargs = {
                    "division": updateData.division,
                    "spare_code": row.spare_code,
                    "spare_description": getattr(existing_record, "spare_description", None),
                    "grc_number": row.grc_number,
                    "grc_date": getattr(existing_record, "grc_date", None),
                    "issue_qty": getattr(existing_record, "issue_qty", None),
                    "grc_pending_qty": getattr(existing_record, "grc_pending_qty", None),
                    "good_qty": good_qty,
                    "defective_qty": defective_qty,
                    "returning_qty": returning_qty,
                    "challan_number": updateData.challan_number,
                    "challan_date": date.today(),
                    "docket_number": updateData.docket_number,
                    "sent_through": updateData.sent_through,
                    "dispute_remark": getattr(existing_record, "dispute_remark", None),
                    "challan_by": token["user"]["username"],
                }
                history_records.append(GRCCGCELReturnHistory(**history_kwargs))
            # Update the main record
            existing_record.challan_by = token["user"]["username"]
            new_good_qty = getattr(row, "good_qty", 0) or 0
            new_defective_qty = getattr(row, "defective_qty", 0) or 0
            existing_record.returning_qty = new_good_qty + new_defective_qty
            prev_returned_qty = getattr(existing_record, "returned_qty", 0) or 0
            existing_record.returned_qty = prev_returned_qty + new_good_qty + new_defective_qty
            prev_actual_pending_qty = getattr(existing_record, "actual_pending_qty", 0) or 0
            existing_record.actual_pending_qty = prev_actual_pending_qty - (new_good_qty + new_defective_qty)
            existing_record.challan_date = date.today()
            existing_record.good_qty = 0
            existing_record.defective_qty = 0
            existing_record.challan_number = updateData.challan_number
            existing_record.sent_through = updateData.sent_through
            existing_record.docket_number = updateData.docket_number
            existing_record.challan_date = date.today()
            existing_record.challan_by = token["user"]["username"]
            updated_records.append(existing_record)
        for rec in updated_records:
            session.add(rec)
        if history_records:
            session.add_all(history_records)
        try:
            await session.commit()
        except Exception as e:
            print("Commit error:", e)

    async def next_cgcel_challan_code(self, session: AsyncSession):
        statement = (
            select(GRCCGCELReturnHistory.challan_number)
            .order_by(GRCCGCELReturnHistory.challan_number.desc())
            .limit(1)
        )
        result = await session.execute(statement)
        last_code = result.scalar()
        last_number = str(last_code)[1:] if last_code else "0"
        next_number = int(last_number) + 1
        next_challan_number = "G" + str(next_number).zfill(5)
        return next_challan_number

    async def generate_grc_report(
        self, report_type: str, data, session: AsyncSession, token
    ):
        # Convert Pydantic model to dict if needed
        if hasattr(data, "model_dump"):
            data_dict = data.model_dump()
        elif hasattr(data, "dict"):
            data_dict = data.dict()
        else:
            data_dict = data

        def generate_overlay(data):
            packet = io.BytesIO()
            can = canvas.Canvas(packet, pagesize=A4)
            width, height = A4

            def draw_centered(can, text, x_start, x_end, y, font="Helvetica", size=9):
                text = "" if text is None else str(text)
                can.setFont(font, size)
                text_width = can.stringWidth(text, font, size)
                x_mid = x_start + (x_end - x_start) / 2
                can.drawString(x_mid - text_width / 2, y, text)

            def draw_block(start_y_offset):
                # Header
                can.setFont("Helvetica-Bold", 10)
                can.drawString(
                    88, 740 - start_y_offset, f"{data.get('challan_number', '')}"
                )
                can.drawString(
                    250, 740 - start_y_offset, date.today().strftime("%d-%m-%Y")
                )
                can.drawString(476, 740 - start_y_offset, f"{data.get('division', '')}")
                can.drawString(
                    476, 704 - start_y_offset, f"{data.get('docket_number', '')}"
                )
                can.drawString(
                    144, 704 - start_y_offset, f"{data.get('sent_through', '')}"
                )
                can.drawString(474, 36 - start_y_offset, f"{token['user']['username']}")

                can.setFont("Helvetica", 11)
                y = 660 - start_y_offset
                items = data.get("grc_rows", [])
                for idx, item in enumerate(items, 1):
                    if report_type == "Defective":
                        draw_centered(can, item.get("grc_number"), 15, 80, y)
                        draw_centered(can, item.get("grc_date"), 80, 135, y)
                        draw_centered(can, item.get("spare_code"), 135, 240, y)
                        draw_centered(can, item.get("spare_description"), 240, 545, y)
                        draw_centered(can, item.get("defective_qty") or 0, 545, 580, y)
                    elif report_type == "Good":
                        draw_centered(can, item.get("grc_number"), 15, 80, y)
                        draw_centered(can, item.get("grc_date"), 80, 135, y)
                        draw_centered(can, item.get("spare_code"), 135, 240, y)
                        draw_centered(can, item.get("spare_description"), 240, 545, y)
                        draw_centered(can, item.get("good_qty") or 0, 545, 580, y)
                    else:
                        draw_centered(can, item.get("grc_number"), 15, 80, y)
                        draw_centered(can, item.get("grc_date"), 80, 135, y)
                        draw_centered(can, item.get("spare_code"), 135, 240, y)
                        draw_centered(can, item.get("spare_description"), 240, 467, y)
                        draw_centered(
                            can, item.get("actual_pending_qty") or 0, 467, 510, y
                        )
                        draw_centered(can, item.get("good_qty") or 0, 510, 545, y)
                        draw_centered(can, item.get("defective_qty") or 0, 545, 580, y)
                    y -= 19
                    if y < 100:
                        break  # Avoid overflow for now

            # Draw only one block (single copy)
            draw_block(start_y_offset=0)

            can.save()
            packet.seek(0)
            return PdfReader(packet)

        overlay = generate_overlay(data_dict)

        # Path to the static PDF template (use absolute path for portability, with path injection protection)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.normpath(os.path.join(base_dir, "..", "static"))
        if report_type == "Defective":
            template_path = safe_join(static_dir, "grc_cgcel_defective.pdf")
        elif report_type == "Good":
            template_path = safe_join(static_dir, "grc_cgcel_good.pdf")
        else:
            template_path = safe_join(static_dir, "grc_cgcel_all.pdf")

        # Read the template PDF
        try:
            with open(template_path, "rb") as f:
                template_bytes = f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Template PDF not found at {template_path}")
        template_buffer = io.BytesIO(template_bytes)
        template_pdf = PdfReader(template_buffer)

        # Merge overlays
        writer = PdfWriter()
        for i in range(len(template_pdf.pages)):
            page = template_pdf.pages[i]
            overlay_page = overlay.pages[min(i, len(overlay.pages) - 1)]
            page.merge_page(overlay_page)
            writer.add_page(page)

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        return output_stream
    
    def _apply_cgcel_filters(
        self,
        statement,
        division=None,
        spare_code=None,
        from_grc_date=None,
        to_grc_date=None,
        grc_number=None,
        challan_number=None,
        model=None,
    ):
        if division:
            statement = statement.where(model.division == division)

        if spare_code:
            statement = statement.where(
                model.spare_code.ilike(f"{spare_code}")
            )

        if from_grc_date:
            statement = statement.where(
                model.grc_date >= from_grc_date
            )

        if to_grc_date:
            statement = statement.where(model.grc_date <= to_grc_date)

        if grc_number:
            statement = statement.where(
                model.grc_number == grc_number
            )

        if challan_number:
            if len(challan_number) != 6:
                challan_number = "G" + str(challan_number).zfill(5)
            statement = statement.where(
                model.challan_number == challan_number
            )        

        return statement

    async def enquiry_grc_cgcel(
        self,
        session: AsyncSession,
        division: Optional[str] = None,
        spare_code: Optional[str] = None,
        from_grc_date: Optional[date] = None,
        to_grc_date: Optional[date] = None,
        grc_number: Optional[str] = None,
        challan_number: Optional[str] = None,
        grc_status: Optional[str] = None,       
        limit: int = 100,
        offset: int = 0,
        return_total: bool = False,
    ):
        if grc_status == "N":
            statement = select(GRCCGCEL)
        else:
            statement = select(GRCCGCELReturnHistory)
        statement = self._apply_cgcel_filters(
            statement,
            division,
            spare_code,
            from_grc_date,
            to_grc_date,
            grc_number,
            challan_number,
            GRCCGCEL if grc_status == "N" else GRCCGCELReturnHistory,
        )

        total_records = None
        if return_total:
            model = GRCCGCEL if grc_status == "N" else GRCCGCELReturnHistory
            if model == GRCCGCELReturnHistory:
                count_query = select(func.count(model.id))
            else:
                subq = select(model.spare_code, model.grc_number).distinct().subquery()
                count_query = select(func.count()).select_from(subq)
            count_query = self._apply_cgcel_filters(
                count_query,
                division,
                spare_code,
                from_grc_date,
                to_grc_date,
                grc_number,
                challan_number,
                model,
            )
            total_result = await session.execute(count_query)
            total_records = total_result.scalar() or 0
        model = GRCCGCEL if grc_status == "N" else GRCCGCELReturnHistory
        statement = statement.order_by(model.spare_code)
        statement = statement.limit(limit).offset(offset)

        result = await session.execute(statement)
        rows = result.scalars().all()
        records = []
        for row in rows:
            # Build dict for only fields present in schema
            record = {}
            record['spare_code'] = getattr(row, 'spare_code', None)
            record['spare_description'] = getattr(row, 'spare_description', None)
            record['grc_number'] = getattr(row, 'grc_number', None)
            record['grc_date'] = format_date_ddmmyyyy(getattr(row, 'grc_date', None))
            record['issue_qty'] = getattr(row, 'issue_qty', None)
            record['grc_pending_qty'] = getattr(row, 'grc_pending_qty', None)
            record['returning_qty'] = getattr(row, 'returning_qty', None)
            record['dispute_remark'] = getattr(row, 'dispute_remark', None)
            record['challan_number'] = getattr(row, 'challan_number', None)
            record['challan_date'] = format_date_ddmmyyyy(getattr(row, 'challan_date', None))
            record['docket_number'] = getattr(row, 'docket_number', None)
            records.append(GRCCGCELEnquiry(**record))
        if return_total:
            return records, total_records
        return records

