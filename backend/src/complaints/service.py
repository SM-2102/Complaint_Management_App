import csv
import io
import os
from datetime import date, datetime
from typing import List, Optional, Union, Any

from fastapi import UploadFile
from pydantic import ValidationError
from sqlalchemy import case, insert, tuple_, update, select, distinct, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func

from utils.date_utils import format_date_ddmmyyyy
from utils.file_utils import capital_to_proper_case
from complaints.schemas import ComplaintReallocateRequestSchema, ComplaintTechniciansReallocationSchema, ComplaintUpdateData, ComplaintsSchema, ComplaintFilterData, ComplaintEnquiryResponseSchema, CreateComplaint, ComplaintCreateData, UpdateComplaint
from complaints.models import Complaint, ActionTable
from employee.models import Employee 
from customer.models import Customer
from exceptions import ComplaintNotFound, ComplaintNumberAlreadyExists, ComplaintNumberGenerationFailed, UpdateFailed

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
            row["complaint_status"] = "FRESH"
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

    async def get_action_heads(self, session: AsyncSession) -> List[str]:
        result = await session.execute(
            select(ActionTable.action_head).order_by(ActionTable.action_head))
        action_heads = result.scalars().all()
        return action_heads
    
    async def get_complaint_filter_data(self, session: AsyncSession) -> ComplaintFilterData:
        # Fetch complaint_number and customer_name together
        result = await session.execute(
            select(Complaint.complaint_number, Complaint.customer_name)
        )
        complaint_numbers_set = set()
        customer_names_set = set()
        for complaint_number, customer_name in result.all():
            if complaint_number:
                complaint_numbers_set.add(complaint_number)
            if customer_name:
                customer_names_set.add(customer_name)

        # Fetch all action_head from ActionTable
        action_head_result = await session.execute(select(ActionTable.action_head).order_by(ActionTable.action_head))
        action_heads = action_head_result.scalars().all()

        # Fetch all username from Employee where is_active='Y' and role != 'ADMIN'
        action_by_result = await session.execute(
            select(Employee.name)
            .where(Employee.is_active == 'Y')
            .where(Employee.role != 'ADMIN')
            .order_by(Employee.name)
        )
        action_bys = action_by_result.scalars().all()

        return ComplaintFilterData(
            complaint_number=list(complaint_numbers_set),
            customer_name=list(customer_names_set),
            action_head=action_heads,
            action_by=action_bys
        )
    
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
        spare_pending_complaints: Optional[str] = None,
        crm_open_complaints: Optional[str] = None,
        escalation_complaints: Optional[str] = None,
        high_priority_complaints: Optional[str] = None,
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
            statement = statement.where(model.complaint_number == complaint_number)
        if customer_contact:
            statement = statement.where(
                (model.customer_contact1 == customer_contact) |
                (model.customer_contact2 == customer_contact)
            )
        if customer_name:
            statement = statement.where(model.customer_name == customer_name)
        if complaint_head and complaint_head != "ALL":
            statement = statement.where(model.complaint_head == complaint_head)
        if spare_pending_complaints == "Y":
            statement = statement.where((model.final_status == "N") & (model.spare_pending == "Y"))
        if crm_open_complaints == "Y":
            statement = statement.where((model.final_status == "N") & (model.complaint_number.notlike("N%"))& (model.complaint_status.notin_(["CLOSED", "NEW", "CANCEL"])))
        if escalation_complaints == "Y":
            statement = statement.where((model.final_status == "N") & (model.complaint_priority.in_(["ESCALATION", "MD-ESCALATION", "HO-ESCALATION"])))
        if high_priority_complaints == "Y":                   
            statement = statement.where((model.final_status == "N") & (model.complaint_priority == "URGENT"))
        if mail_to_be_sent_complaints == "Y":
            statement = statement.where((model.final_status == "N") & (func.upper(model.action_head) == "MAIL TO BE SENT TO HO"))
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
        spare_pending_complaints: Optional[str] = None,
        crm_open_complaints: Optional[str] = None,
        escalation_complaints: Optional[str] = None,
        high_priority_complaints: Optional[str] = None,
        mail_to_be_sent_complaints: Optional[str] = None,
        limit: int = 100,
        offset: int = 0, 
    ):
        statement = select(Complaint)
        statement = self._apply_complaint_filters(
            statement, product_division, complaint_type, complaint_priority, action_head, spare_pending, final_status, action_by, complaint_number, customer_contact, customer_name, complaint_head, spare_pending_complaints, crm_open_complaints, escalation_complaints, high_priority_complaints, mail_to_be_sent_complaints 
        )

        statement = statement.order_by(Complaint.complaint_number)
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
                customer_contact1=row.customer_contact1,
                customer_contact2=row.customer_contact2,
                product_division=row.product_division,
                current_status=row.current_status,
                action_by=row.action_by,
                product_model=row.product_model,
                action_head=row.action_head,
            )
            for row in rows
        ]       
        return records
    
    async def get_employees(self, session: AsyncSession) -> List[str]:
        result = await session.execute(
            select(Employee.name)
            .where(Employee.is_active == 'Y')
            .where(Employee.role != 'ADMIN')
            .order_by(Employee.name)
        )
        technicians = result.scalars().all()
        return technicians
    
    async def get_complaint_reallocation_data(
        self,
        session: AsyncSession,  
        allocated_to: str,
    ):
        statement = select(Complaint.complaint_number, Complaint.complaint_date, Complaint.customer_name, Complaint.current_status, Complaint.product_division).where(Complaint.action_by == allocated_to).where(Complaint.final_status == "N").order_by(Complaint.complaint_number)
        result = await session.execute(statement)
        rows = result.all()
        records = [
            ComplaintTechniciansReallocationSchema(
                complaint_number=row.complaint_number,
                complaint_date=format_date_ddmmyyyy(row.complaint_date),
                customer_name=row.customer_name,
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
                .where(func.upper(Complaint.action_by) == reallocate_request.old_technician)
                .values(action_by=capital_to_proper_case(reallocate_request.new_technician))
            )
            await session.execute(statement)
        await session.commit()

    async def complaint_next_number(self, session: AsyncSession):
        statement = select(Complaint.complaint_number).where(Complaint.complaint_number.startswith("N")).order_by(Complaint.complaint_number.desc()).limit(1)
        result = await session.execute(statement)
        last_number = result.scalar()
        last_number = last_number[1:] if last_number else "0"
        next_number = int(last_number) + 1
        next_number = "N" + str(next_number).zfill(4)
        return next_number

    async def create_complaint(
        self, session: AsyncSession, complaint: CreateComplaint, entryType: str, token: dict
    ):
        if entryType != "NEW":
            # Use provided complaint_number
            existing_complaint = await session.get(Complaint, complaint.complaint_number)
            if existing_complaint:
                raise ComplaintNumberAlreadyExists()
            complaint_data_dict = complaint.model_dump()
            complaint_data_dict["action_by"] = capital_to_proper_case(complaint_data_dict["action_by"])
            complaint_data_dict["technician"] = capital_to_proper_case(complaint_data_dict["technician"])
            complaint_data_dict["complaint_status"] = "NEW"
            complaint_data_dict["complaint_date"] = date.today()
            complaint_data_dict["complaint_time"] = datetime.now().time().replace(microsecond=0)
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
                complaint_data_dict["complaint_number"] = await self.complaint_next_number(session)
                complaint_data_dict["created_by"] = token["user"]["username"]
                complaint_data_dict["action_by"] = capital_to_proper_case(complaint_data_dict["action_by"])
                complaint_data_dict["technician"] = capital_to_proper_case(complaint_data_dict["technician"])
                complaint_data_dict["complaint_date"] = date.today()
                complaint_data_dict["complaint_status"] = "NEW"
                complaint_data_dict["complaint_time"] = datetime.now().time().replace(microsecond=0)
                complaint_data_dict["final_status"] = "N"
                complaint_data_dict["spare_pending"] = "N"
                new_complaint = Complaint(**complaint_data_dict)
                session.add(new_complaint)
                try:
                    await session.commit()
                    return new_complaint
                except IntegrityError as ie:
                    await session.rollback()
            # Include an explanatory message when raising to aid logs/clients
            raise ComplaintNumberGenerationFailed("Failed to generate a unique complaint number after 3 retries")
        

    async def get_complaint_create_data(self, session: AsyncSession) -> ComplaintCreateData:
        # Get next complaint number
        complaint_number = await self.complaint_next_number(session)

        # Fetch customer names
        cust_result = await session.execute(select(Customer.name).order_by(Customer.name))
        customer_names = cust_result.scalars().all()

        # Fetch action heads
        ah_result = await session.execute(select(ActionTable.action_head).order_by(ActionTable.action_head))
        action_heads = ah_result.scalars().all()

        # Fetch active employees (name, role) once and split into action_by and technicians
        emp_result = await session.execute(
            select(Employee.name, Employee.role)
            .where(Employee.is_active == 'Y')
            .order_by(Employee.name)
        )
        emp_rows = emp_result.all()
        action_by = [r[0] for r in emp_rows if (r[1] is None) or (r[1] != 'ADMIN')]
        technicians = [r[0] for r in emp_rows if r[1] == 'TECHNICIAN']

        return ComplaintCreateData(
            complaint_number=complaint_number,
            customer_name=customer_names,
            action_head=action_heads,
            action_by=action_by,
            technician=technicians,
        )
    
    async def get_complaint_by_number(self, complaint_number: str, session: AsyncSession):
        statement = select(Complaint).where(Complaint.complaint_number == complaint_number)
        result = await session.execute(statement)
        complaint = result.scalars().first()
        if complaint:
            return complaint
        else:
            raise ComplaintNotFound()
        
    async def get_complaint_update_data(self, session: AsyncSession) -> ComplaintUpdateData:
        # Get all complaint_number with final status = 'N'
        complaint_result = await session.execute(
            select(Complaint.complaint_number)
            .where(Complaint.final_status == "N")
            .order_by(Complaint.complaint_number)
        )
        complaint_numbers = complaint_result.scalars().all()

        # Fetch customer names
        cust_result = await session.execute(select(Customer.name).order_by(Customer.name))
        customer_names = cust_result.scalars().all()

        # Fetch action heads
        ah_result = await session.execute(select(ActionTable.action_head).order_by(ActionTable.action_head))
        action_heads = ah_result.scalars().all()

        # Fetch active employees (name, role) once and split into action_by and technicians
        emp_result = await session.execute(
            select(Employee.name, Employee.role)
            .where(Employee.is_active == 'Y')
            .order_by(Employee.name)
        )
        emp_rows = emp_result.all()
        action_by = [r[0] for r in emp_rows if (r[1] is None) or (r[1] != 'ADMIN')]
        technicians = [r[0] for r in emp_rows if r[1] == 'TECHNICIAN']

        return ComplaintUpdateData(
            complaint_number=complaint_numbers,
            customer_name=customer_names,
            action_head=action_heads,
            action_by=action_by,
            technician=technicians,
        )
    
    async def update_complaint(
        self, complaint_number: str, complaint: Union[UpdateComplaint, dict, Any], session: AsyncSession, token: dict
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
        existing_complaint = await self.get_complaint_by_number(complaint_number, session)
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
                    # Set action_head to 'Others' as requested (action_type -> Others)
                    "action_head": "Others",
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
                    "updated_time": existing_complaint.updated_time,
                    "appoint_date": existing_complaint.appoint_date,
                }
                create_req = CreateComplaint(**create_payload)
                await self.create_complaint(session, create_req, "NEW" ,token)
            except Exception as e:
                raise ComplaintNumberGenerationFailed()

        for key, value in validated.model_dump().items():
            setattr(existing_complaint, key, value)
        existing_complaint.updated_by = token["user"]["username"]
        existing_complaint.action_by = capital_to_proper_case(existing_complaint.action_by)
        existing_complaint.technician = capital_to_proper_case(existing_complaint.technician)
        try:
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise UpdateFailed()
        await session.refresh(existing_complaint)
        return existing_complaint