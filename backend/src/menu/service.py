from datetime import date, timedelta

from sqlalchemy import case, func, literal, select, union_all
from sqlalchemy.ext.asyncio.session import AsyncSession

from grc_cgcel.models import GRCCGCEL
from grc_cgpisl.models import GRCCGPISL
from stock_cgcel.models import StockCGCEL
from stock_cgpisl.models import StockCGPISL


class MenuService:
    @classmethod

    async def complaint_overview(
        cls,
        session: AsyncSession,
    ) -> dict:
        """
        Returns static complaint overview data for CGCEL and CGPISL.
        Structure:
        {
            "complaint": {
                "division_wise_status": {...},
                "complaint_type": {...},
                "crm_open_complaints": {"CGCEL": int, "CGPISL": int},
                "crm_escalation_complaints": {"CGCEL": int, "CGPISL": int},
                "md_escalation_complaints": {"CGCEL": int, "CGPISL": int},
                "spare_pending_complaints": {"CGCEL": int, "CGPISL": int},
            }
        }
        """
        # Static data for demonstration
        division_wise_status_cgcel = [
            {"division": "FANS", "Y": 10, "N": 5},
            {"division": "MOTOR", "Y": 7, "N": 3},
            {"division": "PUMP", "Y": 12, "N": 2},
        ]
        division_wise_status_cgpisl = [
            {"division": "FANS", "Y": 8, "N": 4},
            {"division": "LIGHT", "Y": 6, "N": 1},
        ]
        complaint_type_cgcel = [
            {"type": "SERVICE", "count": 12},
            {"type": "INSTALL", "count": 8},
            {"type": "SALE", "count": 4},
        ]
        complaint_type_cgpisl = [
            {"type": "SERVICE", "count": 9},
            {"type": "INSTALL", "count": 5},
            {"type": "SALE", "count": 3},
        ]
        # New static counts for demonstration
        crm_open_complaints = {"CGCEL": 5, "CGPISL": 3}
        crm_escalation_complaints = {"CGCEL": 2, "CGPISL": 1}
        md_escalation_complaints = {"CGCEL": 1, "CGPISL": 2}
        spare_pending_complaints = {"CGCEL": 4, "CGPISL": 2}
        high_priority_complaints = {"CGCEL": 3, "CGPISL": 1}
        return {
            "complaint": {
                "division_wise_status": {
                    "CGCEL": division_wise_status_cgcel,
                    "CGPISL": division_wise_status_cgpisl,
                },
                "complaint_type": {
                    "CGCEL": complaint_type_cgcel,
                    "CGPISL": complaint_type_cgpisl,
                },
                "crm_open_complaints": crm_open_complaints,
                "crm_escalation_complaints": crm_escalation_complaints,
                "md_escalation_complaints": md_escalation_complaints,
                "high_priority_complaints": high_priority_complaints,
                "spare_pending_complaints": spare_pending_complaints,
            }
        }
    
    @staticmethod
    async def _division_donut_only(
        session: AsyncSession,
        model,
    ) -> list:
        """
        Aggregate only division_donut for a given stock model.
        Returns:
            [
                {"division": "A", "count": 100},
                ...
            ]
        """
        division_stmt = (
            select(model.division, func.count().label("count"))
            .where(model.division.isnot(None))
            .group_by(model.division)
            .order_by(model.division)
        )
        division_rows = (await session.execute(division_stmt)).all()
        return [{"division": row.division, "count": row.count} for row in division_rows]

    @classmethod
    async def grc_overview(
        cls,
        session: AsyncSession,
    ) -> dict:
        """
        Returns division_donut for GRCCGCEL and GRCGPISL models.
        """
        grc_cgcel_donut = await cls._division_donut_only(session, GRCCGCEL)
        grc_cgpisl_donut = await cls._division_donut_only(session, GRCCGPISL)
        return {
            "grc": {
                "division_wise_donut": {
                    "CGCEL": grc_cgcel_donut,
                    "CGPISL": grc_cgpisl_donut,
                }
            }
        }

    @staticmethod
    async def _aggregate_stock(
        session: AsyncSession,
        model,
    ) -> dict:
        """
        Aggregate stock data for a given stock model.

        Returns:
            {
                "division_donut": [
                    {"division": "A", "count": 100},
                    ...
                ],
                "total_own": 150,
                "total_cnf": 30,
                "total_grc": 20,
                "total_indent": 10,
            }
        """

        # -------------------------------
        # Division-wise aggregation (donut)
        # -------------------------------
        division_stmt = (
            select(
                model.division,
                func.count().label("count"),
            )
            .where(model.division.isnot(None))
            .group_by(model.division)
            .order_by(model.division)
        )
        division_rows = (await session.execute(division_stmt)).all()
        division_donut = [
            {
                "division": row.division,
                "count": row.count,
            }
            for row in division_rows
        ]

        # -------------------------------
        # Overall totals (single row)
        # -------------------------------
        totals_stmt = select(
            func.coalesce(func.sum(model.own_qty), 0).label("own"),
            func.coalesce(func.sum(model.cnf_qty), 0).label("cnf"),
            func.coalesce(func.sum(model.grc_qty), 0).label("grc"),
            func.coalesce(func.sum(model.indent_qty), 0).label("indent"),
        )

        totals_row = (await session.execute(totals_stmt)).one()

        return {
            "division_donut": division_donut,
            "total_own": totals_row.own,
            "total_cnf": totals_row.cnf,
            "total_grc": totals_row.grc,
            "total_indent": totals_row.indent,
        }

    # -----------------------------------
    # Public dashboard API
    # -----------------------------------
    @classmethod
    async def stock_overview(
        cls,
        session: AsyncSession,
    ) -> dict:

        cgcel = await cls._aggregate_stock(session, StockCGCEL)
        cgpisl = await cls._aggregate_stock(session, StockCGPISL)

        return {
            "stock": {
                "division_wise_donut": {
                    "CGCEL": cgcel["division_donut"],
                    "CGPISL": cgpisl["division_donut"],
                },
                "number_of_items_in_stock": {
                    "CGCEL": cgcel["total_own"],
                    "CGPISL": cgpisl["total_own"],
                },
                "number_of_items_in_godown": {
                    "CGCEL": cgcel["total_cnf"],
                    "CGPISL": cgpisl["total_cnf"],
                },
                "number_of_items_issued_in_advance": {
                    "CGCEL": cgcel["total_grc"],
                    "CGPISL": cgpisl["total_grc"],
                },
                "number_of_items_under_process": {
                    "CGCEL": cgcel["total_indent"],
                    "CGPISL": cgpisl["total_indent"],
                },
            }
        }
