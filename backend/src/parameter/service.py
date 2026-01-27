from sqlalchemy import case
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlalchemy.future import select

from parameter.schemas import ParameterSchema
from parameter.models import Parameter

class ParameterService:

    async def list_parameters(self, session: AsyncSession):
        statement = (
            select(Parameter))
        result = await session.execute(statement)
        row = result.scalars().first()
        return ParameterSchema(
            financial_year=row.financial_year,
            invoice_date_smart=row.invoice_date_smart,
            invoice_date_unique=row.invoice_date_unique,
            invoice_no_smart=row.invoice_no_smart,
            invoice_no_unique=row.invoice_no_unique,
            invoicing_permission=row.invoicing_permission,
            rfr_number=row.rfr_number,
        )

    async def update_parameters(
        self,
        session: AsyncSession,
        parameters: ParameterSchema,
    ):
        statement = (
            select(Parameter))
        result = await session.execute(statement)
        row = result.scalars().first()

        row.financial_year = parameters.financial_year
        row.invoice_date_smart = parameters.invoice_date_smart
        row.invoice_date_unique = parameters.invoice_date_unique
        row.invoice_no_smart = parameters.invoice_no_smart
        row.invoice_no_unique = parameters.invoice_no_unique
        row.invoicing_permission = parameters.invoicing_permission
        row.rfr_number = parameters.rfr_number

        session.add(row)
        try:
            await session.commit()
        except IntegrityError as e:
            await session.rollback()
            raise e

        return
