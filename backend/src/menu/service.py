from datetime import date, timedelta

from sqlalchemy import case, func, literal, select, union_all, and_, or_
from sqlalchemy.ext.asyncio.session import AsyncSession

from grc_cgcel.models import GRCCGCEL
from grc_cgpisl.models import GRCCGPISL
from stock_cgcel.models import StockCGCEL
from stock_cgpisl.models import StockCGPISL
from complaints.models import Complaint


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
        # Aggregate division-wise final_status counts (Y/N) and complaint_type
        # We compute both aggregates with as few queries as practical.
        # Division-wise: one query grouping by complaint_head and product_division
        division_expr = case(
    (
        Complaint.product_division.in_(["CG-FANS", "FANS"]),
        "FANS",
    ),
    (
        Complaint.product_division.in_(["CG-PUMP", "PUMP"]),
        "PUMP",
    ),
    (
        Complaint.product_division == "CG-APP",
        "APP",
    ),
    (
        Complaint.product_division == "CG-FHP",
        "FHP",
    ),
    (
        Complaint.product_division == "CG-LT",
        "LT",
    ),
    else_=Complaint.product_division,
)

        division_stmt = (
    select(
        Complaint.complaint_head.label("head"),
        division_expr.label("division"),
        func.sum(case((Complaint.final_status == "Y", 1), else_=0)).label("Y"),
        func.sum(case((Complaint.final_status == "N", 1), else_=0)).label("N"),
    )
    .where(Complaint.product_division.isnot(None))
    .group_by(
        Complaint.complaint_head,
        division_expr,
    )
    .order_by(Complaint.complaint_head, division_expr)
)



        division_rows = (await session.execute(division_stmt)).all()

        # complaint_type: counts grouped by complaint_head and complaint_type
        type_stmt = (
            select(
                Complaint.complaint_head.label("head"),
                Complaint.complaint_type.label("type"),
                func.count().label("count"),
            )
            .group_by(Complaint.complaint_head, Complaint.complaint_type)
            .order_by(Complaint.complaint_head, Complaint.complaint_type)
        )
        type_rows = (await session.execute(type_stmt)).all()

        # Prepare result containers for the two heads we return
        heads = ["CGCEL", "CGPISL"]
        division_wise_status_cgcel = []
        division_wise_status_cgpisl = []
        complaint_type_cgcel = []
        complaint_type_cgpisl = []

        # Populate division-wise lists
        for row in division_rows:
            item = {"division": row.division, "Y": int(row.Y), "N": int(row.N)}
            if row.head == "CGCEL":
                division_wise_status_cgcel.append(item)
            elif row.head == "CGPISL":
                division_wise_status_cgpisl.append(item)

        # Populate complaint-type lists
        for row in type_rows:
            item = {"type": row.type, "count": int(row.count)}
            if row.head == "CGCEL":
                complaint_type_cgcel.append(item)
            elif row.head == "CGPISL":
                complaint_type_cgpisl.append(item)

        # Compute multiple complaint counts per head in a single grouped query
        # Definitions (per request):
        # - CRM OPEN: complaint_number NOT STARTS WITH 'N' AND complaint_status NOT IN ('CANCEL','CLOSED','NEW') AND final_status = 'N'
        # - SPARE PENDING: spare_pending = 'Y' AND final_status = 'N'
        # - ESCALATION: final_status = 'N' AND complaint_status IN ('ESCALATION','MD-ESCALATION','HO-ESCALATION')
        # - HIGH PRIORITY: final_status = 'N' AND complaint_priority = 'URGENT'
        # - MAIL TO BE SENT: final_status = 'N' AND action_head = 'MAIL TO BE SENT'

        counts_stmt = (
            select(
                Complaint.complaint_head.label("head"),
                func.sum(
                    case(
                        (
                            and_(
                                Complaint.final_status == "N",
                                Complaint.complaint_number.like("N%"),
                                func.upper(Complaint.complaint_status).in_(["CANCEL", "CLOSED", "NEW"]),
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ).label("crm_open"),
                func.sum(
                    case((and_(Complaint.final_status == "N", Complaint.spare_pending == "Y"), 1), else_=0)
                ).label("spare_pending"),
                func.sum(
                    case(
                        (
                            and_(
                                Complaint.final_status == "N",
                                func.upper(Complaint.complaint_priority).in_(["ESCALATION", "MD-ESCALATION", "HO-ESCALATION"]),
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ).label("escalation"),
                func.sum(
                    case((and_(Complaint.final_status == "N", func.upper(Complaint.complaint_priority) == "URGENT"), 1), else_=0)
                ).label("high_priority"),
                func.sum(
                    case((and_(Complaint.final_status == "N", func.upper(Complaint.action_head) == "Mail to be Sent To HO"), 1), else_=0)
                ).label("mail_to_be_sent"),
            )
            .group_by(Complaint.complaint_head)
            .order_by(Complaint.complaint_head)
        )

        counts_rows = (await session.execute(counts_stmt)).all()

        # Default zeros for expected heads
        crm_open_complaints = {"CGCEL": 0, "CGPISL": 0}
        escalation_complaints = {"CGCEL": 0, "CGPISL": 0}
        spare_pending_complaints = {"CGCEL": 0, "CGPISL": 0}
        high_priority_complaints = {"CGCEL": 0, "CGPISL": 0}
        mail_to_be_sent_complaints = {"CGCEL": 0, "CGPISL": 0}

        for row in counts_rows:
            head = row.head
            if head not in crm_open_complaints:
                # Skip any unexpected heads but don't fail
                continue
            crm_open_complaints[head] = int(row.crm_open or 0)
            escalation_complaints[head] = int(row.escalation or 0)
            spare_pending_complaints[head] = int(row.spare_pending or 0)
            high_priority_complaints[head] = int(row.high_priority or 0)
            mail_to_be_sent_complaints[head] = int(row.mail_to_be_sent or 0)

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
                "escalation_complaints": escalation_complaints,
                "high_priority_complaints": high_priority_complaints,
                "spare_pending_complaints": spare_pending_complaints,
                "mail_to_be_sent_complaints": mail_to_be_sent_complaints,
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
