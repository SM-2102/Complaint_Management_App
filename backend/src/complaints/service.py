import csv
import io
import os
from datetime import date, datetime
from typing import Any, List, Optional, Union

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, distinct, func, insert, select, tuple_, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from complaints.models import ActionTable, Complaint
from complaints.schemas import (
    ComplaintCreateData,
    ComplaintEnquiryResponseSchema,
    ComplaintFilterData,
    ComplaintReallocateRequestSchema,
    ComplaintsSchema,
    ComplaintTechniciansReallocationSchema,
    ComplaintUpdateData,
    CreateComplaint,
    CreateComplaintRFR,
    EmailSchema,
    GenerateRFRRequestSchema,
    GenerateRFRResponseSchema,
    NewComplaintsSchema,
    UpdateComplaint,
)
from customer.models import Customer
from employee.models import Employee
from exceptions import (
    ComplaintNotFound,
    ComplaintNumberAlreadyExists,
    ComplaintNumberGenerationFailed,
    EmailSendingFailed,
    UpdateFailed,
)
from mail import create_email_message, mail
from parameter.models import Parameter
from utils.date_utils import format_date_ddmmyyyy
from utils.file_utils import capital_to_proper_case


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

        # Fields to convert to uppercase
        uppercase_fields = [
            "complaint_number",
            "complaint_head",
            "complaint_type",
            "complaint_status",
            "complaint_priority",
            "customer_type",
            "customer_name",
            "customer_address1",
            "customer_address2",
            "customer_city",
            "product_division",
            "current_status",
        ]

        for raw_row in reader:
            line_no += 1

            # Normalize CSV headers to snake_case-like keys
            row = {}
            for k, v in raw_row.items():
                key = (k or "").strip().lower()
                val = v.strip() if v else ""
                # Convert to uppercase if field is in uppercase_fields and value is not None
                if key in uppercase_fields and val != "":
                    row[key] = val.upper()
                else:
                    row[key] = val if val != "" else None

            # Override / ensure defaults required by the user
            row["spare_pending"] = "N"
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
        to_reopen = []

        # Determine which columns are present in the CSV (excluding complaint_number)
        present_fields = set()
        for r in records:
            present_fields.update(r.dict(exclude_unset=True).keys())
        present_fields.discard("complaint_number")

        for r in records:
            key = r.complaint_number
            if key in all_db_keys:
                # If complaint exists in DB, ignore this CSV record
                to_reopen.append(key)
                continue

            data_dict = {
                k: v
                for k, v in r.dict(exclude_unset=False).items()
                if k == "complaint_number" or k in present_fields
            }
            to_insert.append(data_dict)

        # Determine DB complaint_numbers (not starting with 'N') missing from CSV
        csv_keys_set = set(keys)
        to_close = [
            k
            for k in all_db_keys
            if (not k.startswith("N")) and (k not in csv_keys_set)
        ]

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
                    .values(final_status="Y")
                )
                updated += len(to_close)

            if to_reopen:
                await session.execute(
                    update(table)
                    .where(table.c.complaint_number.in_(to_reopen))
                    .values(final_status="N")
                )

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
            "message": "Complaints Uploaded",
            "resolution": f"Inserted : {inserted}, Updated : {updated}",
            "type": "success",
        }

    async def upload_new_complaints(self, session: AsyncSession, file: UploadFile):
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

        # Fields to convert to uppercase
        uppercase_fields = [
            "complaint_number",
            "complaint_head",
            "complaint_type",
            "complaint_status",
            "complaint_priority",
            "customer_type",
            "customer_name",
            "customer_address1",
            "customer_address2",
            "customer_city",
            "product_division",
            "current_status",
            "product_model",
            "product_serial_number",
        ]

        for raw_row in reader:
            line_no += 1

            # Normalize CSV headers to snake_case-like keys
            row = {}
            for k, v in raw_row.items():
                key = (k or "").strip().lower()
                val = v.strip() if v else ""
                # Convert to uppercase if field is in uppercase_fields and value is not None
                if key in uppercase_fields and val != "":
                    row[key] = val.upper()
                else:
                    row[key] = val if val != "" else None

            # Override / ensure defaults required by the user
            row["spare_pending"] = "N"
            row["created_by"] = "D Manna"
            row["final_status"] = "N"

            try:
                validated = NewComplaintsSchema(**row)
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

        to_insert = []
        present_fields = set()
        for r in records:
            present_fields.update(r.dict(exclude_unset=True).keys())
        present_fields.discard("complaint_number")

        for r in records:
            data_dict = {
                k: v
                for k, v in r.dict(exclude_unset=False).items()
                if k == "complaint_number" or k in present_fields
            }
            to_insert.append(data_dict)

        inserted = 0

        table = Complaint.__table__

        try:
            if to_insert:
                await session.execute(insert(table).values(to_insert))
                inserted = len(to_insert)

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
            "message": "Complaints Uploaded",
            "resolution": f"Inserted : {inserted}",
            "type": "success",
        }

    async def get_action_heads(self, session: AsyncSession) -> List[str]:
        result = await session.execute(
            select(ActionTable.action_head).order_by(ActionTable.action_head)
        )
        action_heads = result.scalars().all()
        return action_heads

    async def get_complaint_filter_data(
        self, session: AsyncSession
    ) -> ComplaintFilterData:

        # Fetch all action_head from ActionTable
        action_head_result = await session.execute(
            select(Complaint.action_head).distinct().where(Complaint.final_status == "N")
            .order_by(Complaint.action_head)
        )
        action_heads = action_head_result.scalars().all()

        # Fetch all username from Employee where is_active='Y' and role != 'ADMIN'
        action_by_result = await session.execute(
            select(Employee.name)
            .where(Employee.is_active == "Y")
            .where(Employee.role != "ADMIN")
            .order_by(Employee.name)
        )
        action_bys = action_by_result.scalars().all()
        action_bys.append("D Manna")
        action_bys.sort()

        return ComplaintFilterData(action_head=action_heads, action_by=action_bys)

    def _apply_complaint_filters(
        self,
        statement,
        product_division: Optional[str] = None,
        complaint_type: Optional[str] = None,
        complaint_priority: Optional[str] = None,
        action_head: Optional[str] = None,
        spare_pending: Optional[str] = None,
        final_status: Optional[str] = None,
        action_by: Optional[str] = None,
        complaint_number: Optional[str] = None,
        customer_contact: Optional[str] = None,
        customer_name: Optional[str] = None,
        complaint_head: Optional[str] = None,
        complaint_status: Optional[str] = None,
        product_serial_number: Optional[str] = None,
        spare_pending_complaints: Optional[str] = None,
        all_complaints: Optional[str] = None,
        crm_open_complaints: Optional[str] = None,
        escalation_complaints: Optional[str] = None,
        mail_to_be_sent_complaints: Optional[str] = None,
        model=Complaint,
    ):
        if product_division:
            statement = statement.where(model.product_division == product_division)
        if complaint_type:
            statement = statement.where(model.complaint_type == complaint_type)
        if complaint_priority:
            statement = statement.where(model.complaint_priority == complaint_priority)
        if action_head:
            statement = statement.where(model.action_head == action_head)
        if spare_pending:
            statement = statement.where(model.spare_pending == spare_pending)
        if final_status:
            statement = statement.where(model.final_status == final_status)
        if action_by:
            statement = statement.where(model.action_by == action_by)
        if complaint_number:
            statement = statement.where(
                model.complaint_number.ilike(f"%{complaint_number}%")
            )
        if customer_contact:
            statement = statement.where(
                (model.customer_contact1.ilike(f"%{customer_contact}%"))
                | (model.customer_contact2.ilike(f"%{customer_contact}%"))
            )
        if customer_name:
            statement = statement.where(model.customer_name.ilike(f"%{customer_name}%"))
        if complaint_status:
            statement = statement.where(model.complaint_status == complaint_status)
        if product_serial_number:
            statement = statement.where(
                model.product_serial_number.ilike(f"%{product_serial_number}%")
            )
        if complaint_head and complaint_head != "ALL":
            statement = statement.where(model.complaint_head == complaint_head)
        if spare_pending_complaints == "Y":
            statement = statement.where(
                (model.final_status == "N") & (model.spare_pending == "Y")
            )
        if all_complaints == "Y":
            statement = statement.where(model.final_status == "N")
        if crm_open_complaints == "Y":
            statement = statement.where(
                (model.final_status == "N")
                & (model.complaint_number.notlike("N%"))
                & (model.complaint_status.notin_(["CLOSED", "NEW", "CANCEL"]))
            )
        if escalation_complaints == "Y":
            statement = statement.where(
                (model.final_status == "N")
                & (
                    model.complaint_priority.in_(
                        [
                            "ESCALATION",
                            "MD-ESCALATION",
                            "HO-ESCALATION",
                            "CRM-ESCALATION",
                        ]
                    )
                )
            )
        if mail_to_be_sent_complaints == "Y":
            statement = statement.where(
                (model.final_status == "N")
                & (func.upper(model.action_head) == "MAIL TO BE SENT TO HO")
            )
        return statement

    async def enquiry_complaint(
        self,
        session: AsyncSession,
        product_division: Optional[str] = None,
        complaint_type: Optional[str] = None,
        complaint_priority: Optional[str] = None,
        action_head: Optional[str] = None,
        spare_pending: Optional[str] = None,
        final_status: Optional[str] = None,
        action_by: Optional[str] = None,
        complaint_number: Optional[str] = None,
        customer_contact: Optional[str] = None,
        customer_name: Optional[str] = None,
        complaint_head: Optional[str] = None,
        complaint_status: Optional[str] = None,
        product_serial_number: Optional[str] = None,
        spare_pending_complaints: Optional[str] = None,
        all_complaints: Optional[str] = None,
        crm_open_complaints: Optional[str] = None,
        escalation_complaints: Optional[str] = None,
        mail_to_be_sent_complaints: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ):
        statement = select(Complaint)
        statement = self._apply_complaint_filters(
            statement,
            product_division,
            complaint_type,
            complaint_priority,
            action_head,
            spare_pending,
            final_status,
            action_by,
            complaint_number,
            customer_contact,
            customer_name,
            complaint_head,
            complaint_status,
            product_serial_number,
            spare_pending_complaints,
            all_complaints,
            crm_open_complaints,
            escalation_complaints,
            mail_to_be_sent_complaints,
        )

        statement = statement.order_by(
            Complaint.complaint_date, Complaint.complaint_number
        )
        statement = statement.limit(limit).offset(offset)
        result = await session.execute(statement)
        rows = result.scalars().all()
        records = [
            ComplaintEnquiryResponseSchema(
                complaint_number=row.complaint_number,
                complaint_date=format_date_ddmmyyyy(row.complaint_date),
                complaint_time=row.complaint_time,
                complaint_status=row.complaint_status,
                customer_name=row.customer_name,
                customer_address=row.customer_address1
                + (", " + row.customer_address2 if row.customer_address2 else "")
                + ", "
                + row.customer_city
                + " - "
                + row.customer_pincode,
                customer_contact1=row.customer_contact1,
                customer_contact2=row.customer_contact2,
                product_division=row.product_division,
                current_status=row.current_status,
                action_by=row.action_by,
                product_model=row.product_model,
                product_serial_number=row.product_serial_number,
                action_head=row.action_head,
            )
            for row in rows
        ]
        return records

    async def get_employees(self, session: AsyncSession) -> List[str]:
        result = await session.execute(
            select(Employee.name)
            .where(Employee.is_active == "Y")
            .where(Employee.role != "ADMIN")
            .order_by(Employee.name)
        )
        technicians = result.scalars().all()
        return technicians

    async def get_complaint_reallocation_data(
        self,
        session: AsyncSession,
        allocated_to: str,
    ):
        statement = (
            select(
                Complaint.complaint_number,
                Complaint.complaint_date,
                Complaint.customer_name,
                Complaint.current_status,
                Complaint.product_division,
                Complaint.customer_address1,
                Complaint.customer_address2,
                Complaint.customer_city,
                Complaint.customer_pincode,
            )
            .where(Complaint.action_by == allocated_to)
            .where(Complaint.final_status == "N")
            .order_by(Complaint.complaint_number)
        )
        result = await session.execute(statement)
        rows = result.all()
        records = [
            ComplaintTechniciansReallocationSchema(
                complaint_number=row.complaint_number,
                complaint_date=format_date_ddmmyyyy(row.complaint_date),
                customer_name=row.customer_name,
                customer_address=row.customer_address1
                + (", " + row.customer_address2 if row.customer_address2 else "")
                + ", "
                + row.customer_city
                + " - "
                + row.customer_pincode,
                current_status=row.current_status,
                product_division=row.product_division,
            )
            for row in rows
        ]
        return records

    async def reallocate_complaints(
        self,
        session: AsyncSession,
        reallocate_request: ComplaintReallocateRequestSchema,
    ):
        for complaint_number in reallocate_request.complaint_numbers:
            statement = (
                update(Complaint)
                .where(Complaint.complaint_number == complaint_number)
                .where(
                    func.upper(Complaint.action_by) == reallocate_request.old_technician
                )
                .values(
                    action_by=capital_to_proper_case(reallocate_request.new_technician)
                )
            )
            await session.execute(statement)
        await session.commit()

    async def complaint_next_number(self, session: AsyncSession):
        statement = (
            select(Complaint.complaint_number)
            .where(Complaint.complaint_number.startswith("N"))
            .order_by(Complaint.complaint_number.desc())
            .limit(1)
        )
        result = await session.execute(statement)
        last_number = result.scalar()
        last_number = last_number[1:] if last_number else "0"
        next_number = int(last_number) + 1
        next_number = "N" + str(next_number).zfill(5)
        return next_number

    async def create_complaint(
        self,
        session: AsyncSession,
        complaint: CreateComplaint,
        entryType: str,
        token: dict,
    ):
        if entryType != "NEW":
            # Use provided complaint_number
            existing_complaint = await session.get(
                Complaint, complaint.complaint_number
            )
            if existing_complaint:
                raise ComplaintNumberAlreadyExists()
            complaint_data_dict = complaint.model_dump()
            complaint_data_dict["action_by"] = capital_to_proper_case(
                complaint_data_dict["action_by"]
            )
            complaint_data_dict["technician"] = capital_to_proper_case(
                complaint_data_dict["technician"]
            )
            complaint_data_dict["complaint_status"] = "NEW"
            complaint_data_dict["complaint_date"] = date.today()
            complaint_data_dict["complaint_time"] = (
                datetime.now().time().replace(microsecond=0)
            )
            complaint_data_dict["final_status"] = "N"
            complaint_data_dict["spare_pending"] = "N"
            complaint_data_dict["created_by"] = token["user"]["username"]
            new_complaint = Complaint(**complaint_data_dict)
            session.add(new_complaint)
            await session.commit()
            return new_complaint
        else:
            # Generate next complaint_number
            for _ in range(3):  # Retry up to 3 times
                complaint_data_dict = complaint.model_dump()
                complaint_data_dict["complaint_number"] = (
                    await self.complaint_next_number(session)
                )
                complaint_data_dict["created_by"] = token["user"]["username"]
                complaint_data_dict["action_by"] = capital_to_proper_case(
                    complaint_data_dict["action_by"]
                )
                complaint_data_dict["technician"] = capital_to_proper_case(
                    complaint_data_dict["technician"]
                )
                complaint_data_dict["complaint_date"] = date.today()
                complaint_data_dict["complaint_status"] = "NEW"
                complaint_data_dict["complaint_time"] = (
                    datetime.now().time().replace(microsecond=0)
                )
                complaint_data_dict["final_status"] = "N"
                complaint_data_dict["spare_pending"] = "N"
                new_complaint = Complaint(**complaint_data_dict)
                session.add(new_complaint)
                try:
                    await session.commit()
                    return new_complaint
                except IntegrityError:
                    await session.rollback()
            # Include an explanatory message when raising to aid logs/clients
            raise ComplaintNumberGenerationFailed()

    async def get_complaint_create_data(
        self, session: AsyncSession
    ) -> ComplaintCreateData:
        # Get next complaint number
        complaint_number = await self.complaint_next_number(session)

        # Fetch customer names
        cust_result = await session.execute(
            select(Customer.name).order_by(Customer.name)
        )
        customer_names = cust_result.scalars().all()

        # Fetch action heads
        ah_result = await session.execute(
            select(ActionTable.action_head).order_by(ActionTable.action_head)
        )
        action_heads = ah_result.scalars().all()

        # Fetch active employees (name, role) once and split into action_by and technicians
        emp_result = await session.execute(
            select(Employee.name, Employee.role)
            .where(Employee.is_active == "Y")
            .order_by(Employee.name)
        )
        emp_rows = emp_result.all()
        action_by = [r[0] for r in emp_rows if (r[1] is None) or (r[1] != "ADMIN")]
        technicians = [r[0] for r in emp_rows if r[1] == "TECHNICIAN"]

        return ComplaintCreateData(
            complaint_number=complaint_number,
            customer_name=customer_names,
            action_head=action_heads,
            action_by=action_by,
            technician=technicians,
        )

    async def get_complaint_by_number(
        self, complaint_number: str, session: AsyncSession
    ):
        statement = select(Complaint).where(
            Complaint.complaint_number == complaint_number
        )
        result = await session.execute(statement)
        complaint = result.scalars().first()
        if complaint:
            return complaint
        else:
            raise ComplaintNotFound()

    async def get_complaint_update_data(
        self, session: AsyncSession
    ) -> ComplaintUpdateData:
        # Get all complaint_number with final status = 'N'
        complaint_result = await session.execute(
            select(Complaint.complaint_number)
            .where(Complaint.final_status == "N")
            .order_by(Complaint.complaint_number)
        )
        complaint_numbers = complaint_result.scalars().all()

        # Fetch customer names
        cust_result = await session.execute(
            select(Customer.name).order_by(Customer.name)
        )
        customer_names = cust_result.scalars().all()

        # Fetch action heads
        ah_result = await session.execute(
            select(ActionTable.action_head).order_by(ActionTable.action_head)
        )
        action_heads = ah_result.scalars().all()

        # Fetch active employees (name, role) once and split into action_by and technicians
        emp_result = await session.execute(
            select(Employee.name, Employee.role)
            .where(Employee.is_active == "Y")
            .order_by(Employee.name)
        )
        emp_rows = emp_result.all()
        action_by = [r[0] for r in emp_rows if (r[1] is None) or (r[1] != "ADMIN")]
        technicians = [r[0] for r in emp_rows if r[1] == "TECHNICIAN"]

        return ComplaintUpdateData(
            complaint_number=complaint_numbers,
            customer_name=customer_names,
            action_head=action_heads,
            action_by=action_by,
            technician=technicians,
        )

    async def update_complaint(
        self,
        complaint_number: str,
        complaint: Union[UpdateComplaint, dict, Any],
        session: AsyncSession,
        token: dict,
    ):
        revisit_value = None
        if isinstance(complaint, dict):
            revisit_value = complaint.pop("revisit", None)
            try:
                validated = UpdateComplaint(**complaint)
            except ValidationError as ve:
                raise ve
        elif isinstance(complaint, UpdateComplaint):
            validated = complaint
        existing_complaint = await self.get_complaint_by_number(
            complaint_number, session
        )
        if not existing_complaint:
            raise ComplaintNotFound()

        if revisit_value == "Y":
            # Create a new complaint record as a revisit using CreateComplaint schema
            try:
                create_payload = {
                    # complaint_number is required by schema but will be overwritten when complaint_type == 'NEW'
                    "complaint_number": "",
                    "complaint_head": existing_complaint.complaint_head,
                    "complaint_type": existing_complaint.complaint_type,
                    "complaint_priority": existing_complaint.complaint_priority,
                    "action_head": "REVISIT BY TECHNICIAN",
                    "action_by": existing_complaint.action_by,
                    "technician": existing_complaint.technician,
                    "customer_type": existing_complaint.customer_type,
                    "customer_name": existing_complaint.customer_name,
                    "customer_address1": existing_complaint.customer_address1,
                    "customer_address2": existing_complaint.customer_address2,
                    "customer_city": existing_complaint.customer_city,
                    "customer_pincode": existing_complaint.customer_pincode,
                    "customer_contact1": existing_complaint.customer_contact1,
                    "customer_contact2": existing_complaint.customer_contact2,
                    "product_division": existing_complaint.product_division,
                    "product_serial_number": existing_complaint.product_serial_number,
                    "product_model": existing_complaint.product_model,
                    "current_status": existing_complaint.current_status,
                    "appoint_date": existing_complaint.appoint_date,
                }
                create_req = CreateComplaint(**create_payload)
                await self.create_complaint(session, create_req, "NEW", token)
            except Exception as e:
                raise ComplaintNumberGenerationFailed()

        for key, value in validated.model_dump().items():
            setattr(existing_complaint, key, value)
        existing_complaint.updated_by = token["user"]["username"]
        existing_complaint.action_by = capital_to_proper_case(
            existing_complaint.action_by
        )
        existing_complaint.technician = capital_to_proper_case(
            existing_complaint.technician
        )
        try:
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise UpdateFailed()
        await session.refresh(existing_complaint)
        return existing_complaint

    async def send_pending_emails(
        self,
        session: AsyncSession,
        recipients: List[EmailSchema],
    ):
        ESCALATION_STATUSES = {
            "ESCALATION",
            "CRM-ESCALATION",
            "MD-ESCALATION",
            "HO-ESCALATION",
            "URGENT",
        }

        for recipient in recipients:
            statement = (
                select(Complaint)
                .where(
                    Complaint.final_status == "N",
                    func.upper(Complaint.complaint_status) != "CLOSED",
                    Complaint.action_by == recipient.name,
                )
                .order_by(Complaint.complaint_date)
            )

            result = await session.execute(statement)
            complaints = result.scalars().all()

            if not complaints:
                continue  # No pending complaints for this recipient

            # Build table rows
            table_rows = ""

            for row in complaints:
                complaint_datetime = " ".join(
                    filter(
                        None,
                        [
                            (
                                row.complaint_date.strftime("%d-%m-%y")
                                if row.complaint_date
                                else ""
                            ),
                            str(row.complaint_time) if row.complaint_time else "",
                        ],
                    )
                )

                customer_address = ", ".join(
                    filter(
                        None,
                        [
                            row.customer_address1,
                            row.customer_address2,
                            row.customer_city,
                            row.customer_pincode,
                        ],
                    )
                )

                customer_contact = " / ".join(
                    filter(
                        None,
                        [
                            row.customer_contact1,
                            row.customer_contact2,
                        ],
                    )
                )

                # Days difference
                days_old = (
                    (date.today() - row.complaint_date).days
                    if row.complaint_date
                    else 0
                )

                # Escalation logic
                is_escalated = (
                    row.complaint_priority
                    and row.complaint_priority.upper() in ESCALATION_STATUSES
                )

                # Old complaint logic
                is_old = days_old > 4
                is_new = days_old < 2

                # Priority coloring: escalated -> red, old -> yellow, new -> green
                if is_escalated:
                    row_style = "background-color:#fde2e2;"
                elif is_old:
                    row_style = (
                        "background-color:#fff4cc;"  # light yellow / dark yellow text
                    )
                elif is_new:
                    row_style = (
                        "background-color:#e6ffed;"  # light green / dark green text
                    )
                else:
                    row_style = ""

                table_rows += f"""
                    <tr style="{row_style}">
                        <td>{row.complaint_number}</td>
                        <td>{complaint_datetime}</td>
                        <td>{row.complaint_type}</td>
                        <td>{row.complaint_status}</td>
                        <td>{row.customer_name}</td>
                        <td>{customer_address}</td>
                        <td>{customer_contact}</td>
                        <td>{row.product_division}</td>
                        <td>{row.product_model or ""}</td>
                        <td>{row.product_serial_number or ""}</td>
                        <td>{row.current_status}</td>
                    </tr>
                """

            # Email body (HTML table)
            body = f"""
            <p>Dear {recipient.name},</p>

            <p>The following complaints are pending for your action:</p>

            <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                <thead style="background-color: #d6c1f0;">
                    <tr>
                        <th>Number</th>
                        <th>DateTime</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Customer Name</th>
                        <th>Customer Address</th>
                        <th>Contact</th>
                        <th>Div</th>
                        <th>Model</th>
                        <th>Serial No</th>
                        <th>Current Status</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>

            <p style="color:#7a1f1f;font-weight:bold;">
                Rows highlighted in red indicate escalated complaints.
            </p>
            <p style="color:#7a6b00;font-weight:bold;">
                Rows highlighted in yellow indicate overdue complaints.
            </p>
            <p style="color:#116530;font-weight:bold;">
                Rows highlighted in green indicate new complaints.
            </p>
            """

            message = create_email_message(
                subject=f"Latest Complaints as on {datetime.now().strftime("%d-%m-%Y")}",
                recipients=[recipient.email],  # single recipient per mail
                body=body,
            )

            await mail.send_message(message)

        return

    async def get_technician_email_list(
        self,
        session: AsyncSession,
    ) -> List[EmailSchema]:
        statement = (
            select(Employee.name, Employee.email)
            .where(Employee.is_active == "Y")
            .where(Employee.role == "TECHNICIAN")
            .order_by(Employee.name)
        )
        result = await session.execute(statement)
        rows = result.all()
        email_list = [EmailSchema(name=row[0], email=row[1]) for row in rows]
        return email_list

    async def list_all_complaints(
        self,
        session: AsyncSession,
    ):
        statement = select(Complaint.complaint_number).order_by(
            Complaint.complaint_number
        )
        result = await session.execute(statement)
        complaint_numbers = result.scalars().all()
        return complaint_numbers

    async def change_action_head_after_mail(
        self, complaint_numbers, session: AsyncSession
    ):
        if not complaint_numbers:
            return

        statement = (
            update(Complaint)
            .where(Complaint.complaint_number.in_(complaint_numbers))
            .values(action_head="MAIL SENT FOR HO INSTRUCTION", action_by="D Manna")
        )
        await session.execute(statement)
        await session.commit()

    async def create_rfr(self, session: AsyncSession, rfrData: CreateComplaintRFR):
        existing_complaint = await self.get_complaint_by_number(
            rfrData.complaint_number, session
        )
        if not existing_complaint:
            raise ComplaintNotFound()
        # Update the existing complaint with RFR details
        existing_complaint.product_model = rfrData.product_model
        existing_complaint.product_serial_number = rfrData.product_serial_number
        existing_complaint.invoice_date = rfrData.invoice_date
        existing_complaint.invoice_number = rfrData.invoice_number
        existing_complaint.purchased_from = rfrData.purchased_from
        existing_complaint.distributor_name = rfrData.distributor_name
        existing_complaint.customer_type = rfrData.customer_type
        existing_complaint.current_status = rfrData.current_status
        existing_complaint.spare_code = rfrData.spare_code
        existing_complaint.spare_description = rfrData.spare_description
        existing_complaint.indent_date = rfrData.indent_date
        existing_complaint.replacement_reason = rfrData.replacement_reason
        existing_complaint.replacement_remark = rfrData.replacement_remark
        existing_complaint.action_head = "RFR TO BE SENT TO HO"
        await session.commit()
        await session.refresh(existing_complaint)
        return existing_complaint

    async def get_generate_rfr_data(self, session: AsyncSession, product_division):
        statement = (
            select(
                Complaint.complaint_number,
                Complaint.customer_name,
                Complaint.product_model,
                Complaint.product_serial_number,
                Complaint.current_status,
            )
            .where(
                Complaint.action_head == "RFR TO BE SENT TO HO",
                Complaint.product_division == product_division,
                Complaint.final_status == "N",
            )
            .order_by(Complaint.customer_name)
        )
        result = await session.execute(statement)
        rows = result.all()
        records = [
            GenerateRFRResponseSchema(
                complaint_number=row.complaint_number,
                customer_name=row.customer_name,
                product_model=row.product_model,
                product_serial_number=row.product_serial_number,
                current_status=row.current_status,
            )
            for row in rows
        ]
        return records

    async def next_rfr_number(self, session: AsyncSession):
        statement = select(Parameter.rfr_number)
        result = await session.execute(statement)
        last_number = result.scalar()
        last_number = last_number[3:] if last_number else "0"
        next_number = int(last_number) + 1
        next_number = "RFR" + str(next_number).zfill(4)
        return next_number

    async def generate_rfr_report(
        self,
        session: AsyncSession,
        data: GenerateRFRRequestSchema,
        token: dict,
        images: List[UploadFile] | None = None,
        total_quantity: int = None,
    ):
        base_rfr_number = data.rfr_number  # e.g. RFR00012

        for index, complaint_number in enumerate(data.complaint_numbers, start=1):
            if data.rfr_type == "SINGLE":
                rfr_number_to_store = base_rfr_number
            else:  # BULK
                rfr_number_to_store = f"{base_rfr_number}/{index}"

            statement = (
                update(Complaint)
                .where(Complaint.complaint_number == complaint_number)
                .values(
                    action_head="RFR SENT - WAITING FOR HO DECISION",
                    action_by="D Manna",
                    rfr_number=rfr_number_to_store,
                    rfr_date=date.today(),
                )
            )
            await session.execute(statement)

        update_param_stmt = (
            update(Parameter)
            .where(Parameter.id == 1)  
            .values(rfr_number=data.rfr_number)
        )
        await session.execute(update_param_stmt)
        await session.commit()
        
        recipients_list = []
        cc_list = []
        if (data.product_division == "FANS"):
            recipients_list = ["dibyendu.chatterjee@crompton.co.in"]
            cc_list = ["manna.dip2011@gmail.com", "sandipan.gayen@crompton.co.in"]
        elif (data.product_division == "PUMP"):
            recipients_list = ["sandipan.gayen@crompton.co.in"]
            cc_list = ["manna.dip2011@gmail.com"]
        else:
            recipients_list = ["anish.shaw@crompton.co.in"]
            cc_list = ["manna.dip2011@gmail.com", "sandipan.gayen@crompton.co.in"]

        # Send RFR to HO via email
        if data.rfr_type == "BULK":
            await self.send_ow_rfr(
                recipients_list,
                cc_list,
                base_rfr_number,
                data.product_division,
                data.product_type,
                token,
                session,
                images,
            )
        elif data.rfr_type == "SINGLE":
            if data.product_division == "LIGHT":
                await self.send_light_rfr(
                    recipients_list,
                    cc_list,
                    base_rfr_number,
                    token,
                    session,
                    images,
                    total_quantity=total_quantity,
                )
            elif data.product_division == "PUMP":
                await self.send_pump_rfr(
                    recipients_list,
                    cc_list,
                    base_rfr_number,
                    token,
                    session,
                    images,
                )
            elif data.product_division == "FANS":
                await self.send_fan_rfr(
                    recipients_list,
                    cc_list,
                    base_rfr_number,
                    token,
                    session,
                    images,
                )
            else:
                await self.send_appl_rfr(
                    recipients_list,
                    cc_list,
                    base_rfr_number,
                    token,
                    session,
                    images,
                )

    async def send_ow_rfr(
        self,
        recipients: List[str],
        cc: List[str],
        rfr_number: str,
        product_division: str,
        product_type: str,
        token: dict,
        session: AsyncSession,
        images: List[UploadFile] | None = None,
    ):
        if not rfr_number:
            return

        statement = (
            select(Complaint)
            .where(Complaint.rfr_number.startswith(rfr_number))
            .order_by(Complaint.rfr_number)
        )
        result = await session.execute(statement)
        complaints = result.scalars().all()
        if not complaints:
            return  # No complaints found for this RFR number
        # Build table rows
        table_rows = ""

        for row in complaints:
            table_rows += f"""
                <tr>
                    <td style="border:1px solid #d9d9d9;padding:8px;">{row.rfr_number}</td>
                    <td style="border:1px solid #d9d9d9;padding:8px;">{row.technician}</td>
                    <td style="border:1px solid #d9d9d9;padding:8px;">{row.customer_name}</td>
                    <td style="border:1px solid #d9d9d9;padding:8px;">{row.product_model}</td>
                    <td style="border:1px solid #d9d9d9;padding:8px;">{row.product_serial_number}</td>
                    <td style="border:1px solid #d9d9d9;padding:8px;">{row.current_status}</td>
                </tr>
            """

        if product_type == "OW":
            action_line = f"Please do the needful to replace the following OW batch {product_division} for the following :"
        else:  # UG
            action_line = "Please give necessary approval for replacement or issue FG to resolve the issues."

        # Email body (HTML table)
        body = f"""
        <p>Dear Sir,</p>

        <p>{action_line}</p>

        <table width="100%" cellpadding="0" cellspacing="0"
            style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;
                    font-size:13px;color:#333;">
            <tr style="background-color:#f2f2f2;">
                <th style="border:1px solid #d9d9d9;padding:8px;text-align:left;">RFR Number</th>
                <th style="border:1px solid #d9d9d9;padding:8px;text-align:left;">Visited By</th>
                <th style="border:1px solid #d9d9d9;padding:8px;text-align:left;">Customer Name</th>
                <th style="border:1px solid #d9d9d9;padding:8px;text-align:left;">Product Model</th>
                <th style="border:1px solid #d9d9d9;padding:8px;text-align:left;">Serial Number</th>
                <th style="border:1px solid #d9d9d9;padding:8px;text-align:left;">Defect Remark</th>
            </tr>
            {table_rows}
        </table>

            <p style="margin-top:12px;">Regards,</p>
        <p>{token["user"]["username"]}</p>
        """
        attachments = images if images else None


        message = create_email_message(
            subject=f"RFR Number - {rfr_number} for replacement of {product_division}",
            recipients=recipients,
            cc=cc,
            body=body,
            attachments=attachments if attachments else None,
        )
        try:
            await mail.send_message(message)
        except Exception:
            raise EmailSendingFailed()
        return

    async def send_light_rfr(
        self,
        recipients: List[str],
        cc: List[str],
        rfr_number: str,
        token: dict,
        session: AsyncSession,
        images: List[UploadFile] | None = None,
        total_quantity: int = None,
    ):
        if not rfr_number:
            return

        statement = select(Complaint).where(Complaint.rfr_number == rfr_number)
        result = await session.execute(statement)
        complaint = result.scalars().first()
        if not complaint:
            return  # No complaint found for this RFR number

        body = f"""
            <p>Dear Sir,</p>

            <p>Please give necessary approval for replacement.</p>

           <table
                border="1"
                cellpadding="6"
                cellspacing="0"
                style="
                    border-collapse:collapse;
                    width:80%;
                    max-width:800px;
                    margin:0 auto;
                    font-size:14px;
                    font-family:Arial, Helvetica, sans-serif;
                "
                >
            <tr>
            <td><span style="font-weight:500;">Name of ASC</span></td>
            <td>UNIQUE SERVICES</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Technician Name</span></td>
            <td>{complaint.technician}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Customer / Dealer Name</span></td>
            <td>{complaint.customer_name}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Complaint Number</span></td>
            <td>{complaint.complaint_number if not complaint.complaint_number.startswith("N") else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Phone Number</span></td>
            <td>{complaint.customer_contact1}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Address</span></td>
            <td>{complaint.customer_address1}, {complaint.customer_city}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Model No / Catref No / Ordering Code</span></td>
            <td>{complaint.product_model or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Product Serial No / Batch Code</span></td>
            <td>{complaint.product_serial_number or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Total Quantity</span></td>
            <td>{total_quantity}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Spare Required</span></td>
            <td>{complaint.spare_code or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Indent Date</span></td>
            <td>{complaint.indent_date.strftime("%d-%m-%Y") if complaint.indent_date else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Invoice No</span></td>
            <td>{complaint.invoice_number or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Invoice Date</span></td>
            <td>{complaint.invoice_date.strftime("%d-%m-%Y") if complaint.invoice_date else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Dealer Name</span></td>
            <td>{complaint.distributor_name or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Reason for Replacement</span></td>
            <td>{complaint.replacement_reason or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">ASC Remarks</span></td>
            <td>{complaint.replacement_remark or ""}</td>
            </tr>
            </table>

            <p style="margin-top:12px;">Regards,</p>
            <p>{token["user"]["username"]}</p>
            """

        attachments = images if images else None

        message = create_email_message(
            subject=f"RFR Number - {rfr_number} for replacement of {complaint.product_division}",
            recipients=recipients,
            cc=cc,
            body=body,
            attachments=attachments if attachments else None,
        )
        try:
            await mail.send_message(message)
        except Exception:
            raise EmailSendingFailed()
        return

    async def send_pump_rfr(
        self,
        recipients: List[str],
        cc: List[str],
        rfr_number: str,
        token: dict,
        session: AsyncSession,
        images: List[UploadFile] | None = None,
    ):
        if not rfr_number:
            return

        statement = select(Complaint).where(Complaint.rfr_number == rfr_number)
        result = await session.execute(statement)
        complaint = result.scalars().first()
        if not complaint:
            return  # No complaint found for this RFR number

        body = f"""
            <p>Dear Sir,</p>

            <p>Please give necessary approval for replacement.</p>

           <table
                border="1"
                cellpadding="6"
                cellspacing="0"
                style="
                    border-collapse:collapse;
                    width:80%;
                    max-width:800px;
                    margin:0 auto;
                    font-size:14px;
                    font-family:Arial, Helvetica, sans-serif;
                "
                >
            <tr>
            <td><span style="font-weight:500;">Name of ASC</span></td>
            <td>UNIQUE SERVICES</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Technician Name</span></td>
            <td>{complaint.technician}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Customer / Dealer Name</span></td>
            <td>{complaint.customer_name}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Complaint Number</span></td>
            <td>{complaint.complaint_number if not complaint.complaint_number.startswith("N") else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Phone Number</span></td>
            <td>{complaint.customer_contact1}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Address</span></td>
            <td>{complaint.customer_address1}, {complaint.customer_city}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Model No / Catref No / Ordering Code</span></td>
            <td>{complaint.product_model or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Product Serial No / Batch Code</span></td>
            <td>{complaint.product_serial_number or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Spare Required</span></td>
            <td>{complaint.spare_code or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Indent Date</span></td>
            <td>{complaint.indent_date.strftime("%d-%m-%Y") if complaint.indent_date else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Invoice No</span></td>
            <td>{complaint.invoice_number or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Invoice Date</span></td>
            <td>{complaint.invoice_date.strftime("%d-%m-%Y") if complaint.invoice_date else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Dealer Name</span></td>
            <td>{complaint.distributor_name or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Reason for Replacement</span></td>
            <td>{complaint.replacement_reason or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">ASC Remarks</span></td>
            <td>{complaint.replacement_remark or ""}</td>
            </tr>
            </table>

            <p style="margin-top:12px;">Regards,</p>
            <p>{token["user"]["username"]}</p>
            """

        attachments = images if images else None

        message = create_email_message(
            subject=f"RFR Number - {rfr_number} for replacement of {complaint.product_division}",
            recipients=recipients,
            cc=cc,
            body=body,
            attachments=attachments if attachments else None,
        )
        try:
            await mail.send_message(message)
        except Exception:
            raise EmailSendingFailed()
        return

    async def send_fan_rfr(
        self,
        recipients: List[str],
        cc: List[str],
        rfr_number: str,
        token: dict,
        session: AsyncSession,
        images: List[UploadFile] | None = None,
    ):
        if not rfr_number:
            return

        statement = select(Complaint).where(Complaint.rfr_number == rfr_number)
        result = await session.execute(statement)
        complaint = result.scalars().first()
        if not complaint:
            return  # No complaint found for this RFR number

        body = f"""
            <p>
            Dear Sir,
            </p>

            <p>
            Please give necessary approval for replacement or issue FG to resolve the issue.
            </p>

            <div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#000;">

            <p style="text-align:center; font-weight:600; margin-bottom:4px;">
            ANNEXURE – 11
            </p>
            <p style="text-align:center; font-weight:600; margin-top:0;">
            REQUEST FOR REPLACEMENT FORM (RFR)
            </p>

            <p style="font-size:10px; text-align:center;">
            Every replacement required from CGCEL has to be requested on this form which will be prepared by the visiting engineer of the ASC concerned. 
            </p>
            <p style="font-size:10px; text-align:center;">
            Subsequent to the engineer’s recommendation, CGCEL will use its discretion based on whether it meets all criteria set by it.
            </p>

            <table cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; max-width:800px; margin:12px auto;">
            <tr>
                <td style="border:1px solid #000; width:25%;">Branch</td>
                <td style="border:1px solid #000; width:25%;">Kolkata</td>
                <td style="border:1px solid #000; width:25%;">RFR No.</td>
                <td style="border:1px solid #000; width:25%;">{complaint.rfr_number}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">RFR Date</td>
                <td style="border:1px solid #000;">{complaint.rfr_date.strftime("%d-%m-%Y") if complaint.rfr_date else ""}</td>
                <td style="border:1px solid #000;">ASC Name</td>
                <td style="border:1px solid #000;">UNIQUE SERVICES</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">ASC Number</td>
                <td style="border:1px solid #000;">9007031463</td>
                <td style="border:1px solid #000;">Technician Name</td>
                <td style="border:1px solid #000;">{complaint.technician}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">Complaint No.</td>
                <td style="border:1px solid #000;">{complaint.complaint_number if not complaint.complaint_number.startswith("N") else ""}</td>
                <td style="border:1px solid #000;">Complaint Date</td>
                <td style="border:1px solid #000;">{complaint.complaint_date.strftime("%d-%m-%Y") if complaint.complaint_date else ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">Customer / Dealer Name</td>
                <td colspan="3" style="border:1px solid #000;">{complaint.customer_name}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">Product Model & Description</td>
                <td colspan="3" style="border:1px solid #000;">{complaint.product_model or ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">Serial Number</td>
                <td style="border:1px solid #000;">{complaint.product_serial_number or ""}</td>
                <td style="border:1px solid #000;">Purchase Invoice No & Date</td>
                <td style="border:1px solid #000;">
                {complaint.invoice_number or ""} {complaint.invoice_date.strftime("%d-%m-%Y") if complaint.invoice_date else ""}
                </td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">Purchase From / Dealer Name</td>
                <td colspan="3" style="border:1px solid #000;">{complaint.distributor_name or ""}</td>
            </tr>
            </table>
            <table cellpadding="6" cellspacing="0"
                style="border-collapse:collapse; width:100%; max-width:800px; margin:12px auto; font-size:12px;">
            <tr>
                <th colspan="5" style="border:1px solid #000; text-align:center;">
                Complaint History for This Product
                </th>
            </tr>
            <tr>
                <th style="border:1px solid #000; width:6%;">Sl. No.</th>
                <th style="border:1px solid #000; width:24%;">Complaint Number</th>
                <th style="border:1px solid #000; width:18%;">Date</th>
                <th style="border:1px solid #000; width:18%;">Visit Date</th>
                <th style="border:1px solid #000;">Action Taken</th>
            </tr>

            <tr>
                <td style="border:1px solid #000; height:15px;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
            </tr>
            <tr>
                <td style="border:1px solid #000; height:15px;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
            </tr>
            <tr>
                <td style="border:1px solid #000; height:15px;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
            </tr>
            </table>
            <table cellpadding="6" cellspacing="0"
            style="
                border-collapse:collapse;
                width:100%;
                max-width:800px;
                margin:12px auto;
                font-family:Arial, Helvetica, sans-serif;
                font-size:12px;
            ">

            <tr>
                <td colspan="7"
                    style="border:1px solid #000; text-align:center; font-weight:600;">
                Reason for Replacement
                </td>
            </tr>

            <tr>
                <td style="border:1px solid #000; width:24%;">DOA (Defect on Arrival)</td>
                <td style="border:1px solid #000; width:12%;">Dent / Damage<br>Non-Repairable</td>
                <td style="border:1px solid #000; width:10%;">Part Not<br>Available</td>
                <td style="border:1px solid #000; width:12%;">Repeat Failure</td>
                <td style="border:1px solid #000; width:12%;">Quality Issue</td>
                <td style="border:1px solid #000; width:10%;">Others<br>(Exceptional)</td>
            </tr>

            <tr>
                <td style="border:1px solid #000;">Specify Reason From Above List Only</td>
                <td colspan="5" style="border:1px solid #000;">{complaint.replacement_reason or ""}</td>
            </tr>

            <tr>
                <td style="border:1px solid #000;">Explain / Justify the Reason for Replacement</td>
                <td colspan="5" style="border:1px solid #000;">{complaint.replacement_remark or ""}</td>
            </tr>

            </table>
            <table cellpadding="6" cellspacing="0"
            style="
                border-collapse:collapse;
                width:100%;
                max-width:800px;
                margin:12px auto;
                font-family:Arial, Helvetica, sans-serif;
                font-size:12px;
            ">

            <tr>
                <td style="border:1px solid #000;">Part Code</td>
                <td style="border:1px solid #000;">{complaint.spare_code or ""}</td>
                <td style="border:1px solid #000;">Part Name</td>
                <td style="border:1px solid #000;">{complaint.spare_description or ""}</td>
            </tr>
            <tr>
                <td style="border:1px solid #000;">ASC Part Indent Date</td>
                <td style="border:1px solid #000;">{complaint.indent_date.strftime("%d-%m-%Y") if complaint.indent_date else ""}</td>
                <td style="border:1px solid #000;">ASC Follow-up</td>
                <td style="border:1px solid #000;">{complaint.current_status or ""}</td>
            </tr>

            </table>
            <table cellpadding="6" cellspacing="0"
            style="
                border-collapse:collapse;
                width:100%;
                max-width:800px;
                margin:12px auto;
                font-family:Arial, Helvetica, sans-serif;
                font-size:12px;
            ">

            <tr>
                <td style="border:1px solid #000; width:20%;">Supply Voltage</td>
                <td style="border:1px solid #000; width:20%;">Supply Current</td>
                <td style="border:1px solid #000; width:20%;">Earthing (Yes / No)</td>
                <td style="border:1px solid #000; width:20%;">Coil Resistance</td>
                <td style="border:1px solid #000; width:20%;">RPM Reading</td>
            </tr>

            <tr>
                <td style="border:1px solid #000; height:15px;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
                <td style="border:1px solid #000;"></td>
            </tr>

            </table>


            </div>


            <p style="margin-top:12px;">
            Regards,
            </p>

            <p>
            {token["user"]["username"]}
            </p>

            """

        attachments = images if images else None

        message = create_email_message(
            subject=f"RFR Number - {rfr_number} for replacement of {complaint.product_division}",
            recipients=recipients,
            cc=cc,
            body=body,
            attachments=attachments if attachments else None,
        )
        try:
            await mail.send_message(message)
        except Exception:
            raise EmailSendingFailed()
        return

    async def send_appl_rfr(
        self,
        recipients: List[str],
        cc: List[str],
        rfr_number: str,
        token: dict,
        session: AsyncSession,
        images: List[UploadFile] | None = None,
    ):
        if not rfr_number:
            return

        statement = select(Complaint).where(Complaint.rfr_number == rfr_number)
        result = await session.execute(statement)
        complaint = result.scalars().first()
        if not complaint:
            return  # No complaint found for this RFR number

        body = f"""
            <p>Dear Sir,</p>

            <p>Please give necessary approval for replacement.</p>
            <div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#000;">

            <p style="text-align:center; font-weight:600; margin-bottom:4px;">
            ANNEXURE – 11
            </p>
            <p style="text-align:center; font-weight:600; margin-top:0;">
            REQUEST FOR REPLACEMENT FORM (RFR)
            </p>

            <p style="font-size:10px; text-align:center;">
            Every replacement required from CGCEL has to be requested on this form which will be prepared by the visiting engineer of the ASC concerned. 
            </p>
            <p style="font-size:10px; text-align:center;">
            Subsequent to the engineer’s recommendation, CGCEL will use its discretion based on whether it meets all criteria set by it.
            </p>
           <table
                border="1"
                cellpadding="6"
                cellspacing="0"
                style="
                    border-collapse:collapse;
                    width:80%;
                    max-width:800px;
                    margin:0 auto;
                    font-size:14px;
                    font-family:Arial, Helvetica, sans-serif;
                "
                >
            <tr>
            <td><span style="font-weight:500;">ASC Name & City</span></td>
            <td>UNIQUE SERVICES, KOLKATA</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Technician Name</span></td>
            <td>{complaint.technician}</td>
            </tr>
            <tr>
            <tr>
            <td><span style="font-weight:500;">Observation</span></td>
            <td>{complaint.current_status}</td>
            </tr>
            <td><span style="font-weight:500;">Complaint Number</span></td>
            <td>{complaint.complaint_number if not complaint.complaint_number.startswith("N") else ""}</td>
            </tr>
            <tr>
            <tr>
            <td><span style="font-weight:500;">Customer / Dealer Name</span></td>
            <td>{complaint.customer_name}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Phone Number</span></td>
            <td>{complaint.customer_contact1}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Address</span></td>
            <td>{complaint.customer_address1}, {complaint.customer_city}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Model No / Catref No / Ordering Code</span></td>
            <td>{complaint.product_model or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Product Serial No / Batch Code</span></td>
            <td>{complaint.product_serial_number or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Spare Required</span></td>
            <td>{complaint.spare_code or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Indent Date</span></td>
            <td>{complaint.indent_date.strftime("%d-%m-%Y") if complaint.indent_date else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Dealer Name</span></td>
            <td>{complaint.distributor_name or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Invoice No</span></td>
            <td>{complaint.invoice_number or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Invoice Date</span></td>
            <td>{complaint.invoice_date.strftime("%d-%m-%Y") if complaint.invoice_date else ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">Reason for Replacement</span></td>
            <td>{complaint.replacement_reason or ""}</td>
            </tr>
            <tr>
            <td><span style="font-weight:500;">ASC Remarks</span></td>
            <td>{complaint.replacement_remark or ""}</td>
            </tr>
            </table>
            </div>

            <p style="margin-top:12px;">Regards,</p>
            <p>{token["user"]["username"]}</p>
            """

        attachments = images if images else None

        message = create_email_message(
            subject=f"RFR Number - {rfr_number} for replacement of {complaint.product_division}",
            recipients=recipients,
            cc=cc,
            body=body,
            attachments=attachments if attachments else None,
        )
        try:
            await mail.send_message(message)
        except Exception:
            raise EmailSendingFailed()
        return