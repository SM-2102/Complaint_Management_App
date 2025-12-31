from datetime import date
import csv
import io
from datetime import date
import os
from typing import List, Optional
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from utils.file_utils import safe_join
from grc_cgcel.schemas import (
    GRCCGCELReturnSave,
    GRCCGCELSchema,
    GRCCGCELReceiveSchema,
    GRCCGCELUpdateReceiveSchema,
    GRCCGCELDisputeCreate,
    GRCCGCELReturnSchema,
    GRCFullPayload,
    GRCCGCELHistorySchema,
)
from grc_cgcel.models import GRCCGCEL, GRCCGCELDispute, GRCCGCELReturnHistory
from exceptions import SpareNotFound
from utils.date_utils import format_date_ddmmyyyy


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
            data_dict['status'] = 'N'
            key = (r.spare_code, r.grc_number)
            if key in existing:
                to_update[key] = data_dict
            else:
                to_insert.append(data_dict)

        inserted = 0
        updated = 0

        table = GRCCGCEL.__table__

        try:
            await session.execute(update(table).values(status='Y'))

            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

            if to_update:
                # Only update fields present in the CSV (excluding spare_code, grc_number)
                update_fields = present_fields.copy()
                update_fields.add('status')
                for key, values in to_update.items():
                    stmt = (
                        update(table)
                        .where(
                            (table.c.spare_code == key[0]) & (table.c.grc_number == key[1])
                        )
                        .values(**{field: values[field] for field in update_fields if field in values})
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
    
    async def not_received_grc_numbers(
        self, session: AsyncSession
    ):
        statement = select(GRCCGCEL.grc_number).where(
            GRCCGCEL.receive_date.is_(None),
        ).distinct()
        result = await session.execute(statement)
        rows = result.scalars().all()
        return rows
    
    async def not_received_by_grc_number(
        self, grc_number: int, session: AsyncSession
    ):
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
                defective_qty=row.defective_qty,
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
                    division=getattr(data, "division", getattr(existing_record, "division", None)),
                    grc_number=data.grc_number,
                    grc_date=getattr(existing_record, "grc_date", None),
                    spare_description=getattr(data, "spare_description", getattr(existing_record, "spare_description", None)),
                    issue_qty=getattr(existing_record, "issue_qty", None),
                    grc_pending_qty=getattr(data, "grc_pending_qty", getattr(existing_record, "grc_pending_qty", None)),
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

    async def grc_return_by_division(
        self, division: str, session: AsyncSession
    ):
        statement = select(GRCCGCEL).where(
            GRCCGCEL.division == division,
            GRCCGCEL.status == 'N',
        )
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

    async def get_grc_cgcel_by_code(self, spare_code: str, grc_number: int, session: AsyncSession):
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
        self, updateData: List[GRCCGCELReturnSave], session: AsyncSession,
    ):
        for data in updateData:
            existing_record = await self.get_grc_cgcel_by_code(
                data.spare_code, data.grc_number, session
            )
            for key, value in data.model_dump().items():
                if key not in ("spare_code", "grc_number") and value is not None:
                    setattr(existing_record, key, value)
            session.add(existing_record)
        try:
            await session.commit()
        except:
            await session.rollback()

    async def finalize_cgcel_grc_return(
        self, updateData: List[GRCCGCELReturnSave], session: AsyncSession, token: dict
    ):
        for data in updateData:
            # Save history BEFORE updating CGCEL only if invoice == 'N'
            existing_record = await self.get_grc_cgcel_by_code(
                data.spare_code, data.grc_number, session
            )
            good_qty = getattr(data, "good_qty", 0) or 0
            defective_qty = getattr(data, "defective_qty", 0) or 0
            returning_qty = good_qty + defective_qty
            invoice_val = getattr(data, "invoice", None)
            if invoice_val == "N":
                history_kwargs = {
                    "division": getattr(existing_record, "division", None),
                    "spare_code": getattr(data, "spare_code", None),
                    "spare_description": getattr(existing_record, "spare_description", None),
                    "grc_number": getattr(data, "grc_number", None),
                    "grc_date": getattr(existing_record, "grc_date", None),
                    "issue_qty": getattr(existing_record, "issue_qty", None),
                    "grc_pending_qty": getattr(existing_record, "grc_pending_qty", None),
                    "good_qty": good_qty,
                    "defective_qty": defective_qty,
                    "returning_qty": returning_qty,
                    "invoice": invoice_val,
                    "challan_number": getattr(data, "challan_number", None),
                    "challan_date": getattr(data, "challan_date", None),
                    "docket_number": getattr(data, "docket_number", None),
                    "sent_through": getattr(data, "sent_through", None),
                    "remark": getattr(data, "dispute_remark", None),
                    "challan_by": token["user"]["username"],
                }
                history_record = GRCCGCELReturnHistory(**history_kwargs)
                session.add(history_record)

            for key, value in data.model_dump().items():
                if key not in ("spare_code", "grc_number") and value is not None:
                    setattr(existing_record, key, value)
            # Set returned_qty = (good_qty or 0) + (defective_qty or 0)
            existing_good_qty = getattr(existing_record, "good_qty", 0) or 0
            existing_defective_qty = getattr(existing_record, "defective_qty", 0) or 0
            existing_record.returning_qty = existing_good_qty + existing_defective_qty
            prev_returned_qty = getattr(existing_record, "returned_qty", 0) or 0
            existing_record.returned_qty = prev_returned_qty + existing_good_qty + existing_defective_qty
            prev_actual_pending_qty = getattr(existing_record, "actual_pending_qty", 0) or 0
            existing_record.actual_pending_qty = prev_actual_pending_qty - (existing_good_qty + existing_defective_qty)
            existing_record.good_qty = 0
            existing_record.defective_qty = 0
            existing_record.challan_by = token["user"]["username"]
            session.add(existing_record)
        try:
            await session.commit()
        except:
            await session.rollback()

        


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

            def draw_block(start_y_offset):
                # Header
                can.setFont("Helvetica-Bold", 10)
                can.drawString(50, 780 - start_y_offset, f"Challan No: {data.get('challan_code', '')}")
                can.drawString(250, 780 - start_y_offset, f"Division: {data.get('division', '')}")
                can.drawString(50, 765 - start_y_offset, f"Docket No: {data.get('docket_number', '')}")
                can.drawString(250, 765 - start_y_offset, f"Sent Through: {data.get('sent_through', '')}")

                can.setFont("Helvetica-Bold", 9)
                y = 740 - start_y_offset
                if report_type == "Defective":
                    headers = [
                        ("Sl No", 30),
                        ("GRC No", 65),
                        ("GRC Date", 110),
                        ("Spare Code/Description", 170),
                        ("Defective Qty", 440),
                    ]
                elif report_type == "Good":
                    headers = [
                        ("Sl No", 30),
                        ("GRC No", 65),
                        ("GRC Date", 110),
                        ("Spare Code/Description", 170),
                        ("Good Qty", 440),
                    ]
                else:
                    headers = [
                        ("Sl No", 30),
                        ("GRC No", 65),
                        ("GRC Date", 110),
                        ("Spare Code/Description", 170),
                        ("Actual Pending Qty", 320),
                        ("Good Qty", 390),
                        ("Defective Qty", 440),
                        ("Returned Qty", 500),
                    ]
                for text, x in headers:
                    can.drawString(x, y, text)

                can.setFont("Helvetica", 8)
                y -= 15
                items = data.get('grc_rows', [])
                for idx, item in enumerate(items, 1):
                    if report_type == "Defective":
                        can.drawString(30, y, str(idx))
                        can.drawString(65, y, str(item.get('grc_number', '')))
                        can.drawString(110, y, str(item.get('grc_date', '')))
                        can.drawString(170, y, str(item.get('spare_code_spare_description', '')))
                        can.drawString(440, y, str(item.get('defective_qty', '')))
                    elif report_type == "Good":
                        can.drawString(30, y, str(idx))
                        can.drawString(65, y, str(item.get('grc_number', '')))
                        can.drawString(110, y, str(item.get('grc_date', '')))
                        can.drawString(170, y, str(item.get('spare_code_spare_description', '')))
                        can.drawString(440, y, str(item.get('good_qty', '')))
                    else:
                        can.drawString(30, y, str(idx))
                        can.drawString(65, y, str(item.get('grc_number', '')))
                        can.drawString(110, y, str(item.get('grc_date', '')))
                        can.drawString(170, y, str(item.get('spare_code_spare_description', '')))
                        can.drawString(320, y, str(item.get('actual_pending_qty', '')))
                        can.drawString(390, y, str(item.get('good_qty', '')))
                        can.drawString(440, y, str(item.get('defective_qty', '')))
                        can.drawString(500, y, str(item.get('returned_qty', '')))
                    y -= 15
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
            template_path = safe_join(static_dir, "grc_defective.pdf")
        elif report_type == "Good":
            template_path = safe_join(static_dir, "grc_good.pdf")
        else:
            template_path = safe_join(static_dir, "grc_all.pdf")

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
