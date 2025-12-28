from sqlite3 import IntegrityError

from sqlalchemy import case
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from notification.models import Notification
from notification.schema import NotificationCreate


class NotificationService:

    async def list_notifications(self, session: AsyncSession):
        statement = (
            select(Notification)
            .where(Notification.resolved == "N")
            .order_by(Notification.id.asc())
        )
        result = await session.execute(statement)
        return result.scalars().all()

    async def count_notifications(self, session: AsyncSession):
        statement = select(Notification).where(Notification.resolved == "N")
        result = await session.execute(statement)
        return len(result.scalars().all())

    async def list_user_notifications(self, session: AsyncSession, token: dict):
        statement = select(Notification).where(
            (Notification.assigned_to == token["user"]["username"])
            & (Notification.resolved == "N")
        )
        result = await session.execute(statement)
        return result.scalars().all()

    async def create_notification(
        self, session: AsyncSession, notification: NotificationCreate
    ):
        for name in notification.assigned_to:
            new_notification = Notification(
                details=notification.details, assigned_to=name, resolved="N"
            )
            session.add(new_notification)
            try:
                await session.commit()
            except:
                await session.rollback()
                raise IntegrityError()

    async def resolve_notification(self, session: AsyncSession, notification_id: int):
        statement = select(Notification).where(Notification.id == notification_id)
        result = await session.execute(statement)
        notification = result.scalars().first()
        if notification:
            notification.resolved = "Y"
            session.add(notification)
            await session.commit()
        else:
            raise Exception("Notification not found")


#     async def employee_exists(self, name: str, session: AsyncSession) -> bool:
#         name = name.strip()
#         name = " ".join(name.split())
#         statement = select(Employee).where(
#             Employee.name.ilike(name)
#         )
#         result = await session.execute(statement)
#         return result.scalars().first()

#     async def get_employee_by_name(self, name: str, session: AsyncSession):
#         name = name.strip()
#         name = " ".join(name.split())
#         statement = select(Employee).where(
#             Employee.name.ilike(name), Employee.is_active == "Y"
#         )
#         result = await session.execute(statement)
#         return result.scalars().first()

#     async def delete_employee(self, employee: EmployeeLeave, session: AsyncSession, token: dict):
#         employee_to_delete = await self.get_employee_by_name(employee.name, session)
#         if not employee_to_delete:
#             raise EmployeeNotFound()
#         if token["user"]["username"] == employee.name:
#             raise CannotDeleteCurrentUser()
#         employee_to_delete.is_active = "N"
#         employee_to_delete.leaving_date = employee.leaving_date
#         session.add(employee_to_delete)
#         await session.commit()
#         if employee_to_delete.role in ["ADMIN", "USER"]:
#             await user_service.delete_user(employee.name, session)
