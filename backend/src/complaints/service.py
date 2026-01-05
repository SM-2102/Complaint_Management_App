import csv
import io
import os
from datetime import date
from typing import List, Optional

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, tuple_, update, select, distinct
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from utils.date_utils import format_date_ddmmyyyy
from utils.file_utils import safe_join
from complaints.schemas import ComplaintsSchema
from complaints.models import Complaint


class ComplaintsService:
    async def upload_complaints(self, session: AsyncSession, file: UploadFile):
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

            # Normalize CSV headers to snake_case-like keys
            row = {}
            for k, v in raw_row.items():
                val = v.strip() if v else ""
                row[key] = val if val != "" else None

            # Override / ensure defaults required by the user
            row["spare_pending"] = "N"
            row["status"] = "FRESH"
            row["created_by"] = "D Manna"
            row["final_status"] = "N"

            try:
                validated = ComplaintsSchema(**row)
            except ValidationError as ve:
                return {
                    "message": f"Validation failed for {row.get('complaint_number')}",
                    "resolution": str(ve),
                    "type": "warning",
                }

            records.append(validated)

        if not records:
            return {
                "message": "Uploaded Successfully",
                "resolution": "No valid rows found",
            }


        # Use complaint_number as key for insert-only behavior: ignore CSV rows
        # that already exist in DB. New complaint_numbers will be inserted.
        keys = [r.complaint_number for r in records]

        # All complaint numbers already in DB
        all_db_result = await session.execute(select(Complaint.complaint_number))
        all_db_keys = {r[0] for r in all_db_result.all()}

        to_insert = []

        # Determine which columns are present in the CSV (excluding complaint_number)
        present_fields = set()
        for r in records:
            present_fields.update(r.dict(exclude_unset=True).keys())
        present_fields.discard("complaint_number")

        for r in records:
            key = r.complaint_number
            if key in all_db_keys:
                # If complaint exists in DB, ignore this CSV record
                continue

            data_dict = {
                k: v
                for k, v in r.dict(exclude_unset=False).items()
                if k == "complaint_number" or k in present_fields
            }
            to_insert.append(data_dict)

        # Determine DB complaint_numbers (not starting with 'N') missing from CSV
        csv_keys_set = set(keys)
        to_close = [k for k in all_db_keys if (not k.startswith("N")) and (k not in csv_keys_set)]

        inserted = 0
        updated = 0


        table = Complaint.__table__

        try:
            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

            if to_close:
                await session.execute(
                    update(table)
                    .where(table.c.complaint_number.in_(to_close))
                    .values(complaint_status="Closed", final_status="Y")
                )
                updated += len(to_close)

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
            "message": "Complaints Uploaded",
            "resolution": f"Inserted : {inserted}, Updated : {updated}",
            "type": "success",
        }

  