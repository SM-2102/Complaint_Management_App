# from datetime import date, timedelta

# from sqlalchemy import case, func, literal, select, union_all
# from sqlalchemy.ext.asyncio.session import AsyncSession

# from challan.models_smart import ChallanSmart
# from challan.models_unique import ChallanUnique
# from master.models import Master
# from out_of_warranty.models import OutOfWarranty
# from retail.models import Retail
# from service_center.models import ServiceCentre
# from warranty.models import Warranty


# class MenuService:

#     # ---------------------------
#     # GROUP 1 — MASTER + ASC + TOP CUSTOMERS
#     # ---------------------------
#     async def master_overview(self, session: AsyncSession):
#         """
#         Returns:
#         {
#             "master_count": int,
#             "asc_count": int,
#             "top_customers": {name: count, ...}
#         }
#         """
#         # build combined CTE used for top customers
#         combined_cte = union_all(
#             select(Master.code),
#             select(Retail.code),
#             select(ChallanSmart.code),
#             select(Warranty.code),
#             select(OutOfWarranty.code),
#         ).cte("combined_cte")

#         # top customers aggregation
#         top_stmt = (
#             select(Master.name, func.count().label("total_count"))
#             .join(combined_cte, Master.code == combined_cte.c.code)
#             .group_by(Master.name)
#             .order_by(func.count().desc())
#             .limit(5)
#         )

#         # scalar counts
#         master_count_stmt = select(func.count(Master.code))
#         asc_count_stmt = select(func.count(ServiceCentre.asc_name))

#         # Execute: note these are executed sequentially on the same session
#         master_count = (await session.execute(master_count_stmt)).scalar()
#         asc_count = (await session.execute(asc_count_stmt)).scalar()
#         top_rows = (await session.execute(top_stmt)).all()

#         top_customers = {row.name: row.total_count for row in top_rows}

#         return {
#             "master_count": master_count or 0,
#             "asc_count": asc_count or 0,
#             "top_customers": top_customers,
#         }

#     # ---------------------------
#     # GROUP 2 — RETAIL
#     # ---------------------------
#     async def retail_overview(self, session: AsyncSession):
#         """
#         Returns:
#         {
#             "division_counts": [{"division":..., "count":...}, ...],
#             "pie": {
#                 "not_received": int,
#                 "received_not_settled": int,
#                 "propose_for_settlement": int,
#                 "settled": int
#             }
#         }
#         """
#         division_stmt = select(Retail.division, func.count()).group_by(Retail.division)

#         pie_stmt = select(
#             func.count(
#                 case(((Retail.received == "N") & (Retail.settlement_date.is_(None)), 1))
#             ).label("not_received"),
#             func.count(
#                 case(((Retail.received == "Y") & (Retail.settlement_date.is_(None)), 1))
#             ).label("received_not_settled"),
#             func.count(
#                 case(
#                     (
#                         (Retail.settlement_date.is_not(None))
#                         & (Retail.final_status == "N"),
#                         1,
#                     )
#                 )
#             ).label("propose_for_settlement"),
#             func.count(case((Retail.final_status == "Y", 1))).label("settled"),
#         )

#         div_rows = (await session.execute(division_stmt)).all()
#         pie_row = (await session.execute(pie_stmt)).mappings().first() or {}

#         return {
#             "division_counts": [
#                 {"division": division, "count": count} for division, count in div_rows
#             ],
#             "pie": {
#                 "not_received": pie_row.get("not_received", 0),
#                 "received_not_settled": pie_row.get("received_not_settled", 0),
#                 "propose_for_settlement": pie_row.get("propose_for_settlement", 0),
#                 "settled": pie_row.get("settled", 0),
#             },
#         }

#     # ---------------------------
#     # GROUP 3 — CHALLAN
#     # ---------------------------
#     async def challan_overview(self, session: AsyncSession):
#         """
#         Returns combined stats from ChallanSmart + ChallanUnique.
#         """

#         # ---- 1) Create UNION ALL subquery for both tables ----

#         # Define qty_expr for each table separately to avoid cartesian product
#         smart_qty_expr = (
#             func.coalesce(ChallanSmart.qty1, 0)
#             + func.coalesce(ChallanSmart.qty2, 0)
#             + func.coalesce(ChallanSmart.qty3, 0)
#             + func.coalesce(ChallanSmart.qty4, 0)
#             + func.coalesce(ChallanSmart.qty5, 0)
#             + func.coalesce(ChallanSmart.qty6, 0)
#             + func.coalesce(ChallanSmart.qty7, 0)
#             + func.coalesce(ChallanSmart.qty8, 0)
#         )

#         unique_qty_expr = (
#             func.coalesce(ChallanUnique.qty1, 0)
#             + func.coalesce(ChallanUnique.qty2, 0)
#             + func.coalesce(ChallanUnique.qty3, 0)
#             + func.coalesce(ChallanUnique.qty4, 0)
#             + func.coalesce(ChallanUnique.qty5, 0)
#             + func.coalesce(ChallanUnique.qty6, 0)
#             + func.coalesce(ChallanUnique.qty7, 0)
#             + func.coalesce(ChallanUnique.qty8, 0)
#         )

#         # Build a SELECT for Smart
#         smart_sel = select(
#             ChallanSmart.challan_number,
#             ChallanSmart.challan_date,
#             smart_qty_expr.label("qty"),
#         )

#         # Build a SELECT for Unique (schema same)
#         unique_sel = select(
#             ChallanUnique.challan_number,
#             ChallanUnique.challan_date,
#             unique_qty_expr.label("qty"),
#         )

#         # UNION both tables
#         union_subq = smart_sel.union_all(unique_sel).subquery()

#         # ---- 2) Aggregation queries on the union ----

#         # Total challan count
#         challan_count_stmt = select(func.count(union_subq.c.challan_number))

#         # Total quantity across all rows
#         items_stmt = select(func.coalesce(func.sum(union_subq.c.qty), 0))

#         # Rolling monthly totals
#         cutoff_date = date.today().replace(day=1) - timedelta(days=150)
#         month_expr = func.to_char(
#             func.date_trunc("month", union_subq.c.challan_date), "YYYY-MM"
#         )

#         rolling_stmt = (
#             select(
#                 month_expr.label("month"),
#                 func.count().label("total_challans"),
#                 func.sum(union_subq.c.qty).label("total_quantity"),
#             )
#             .where(union_subq.c.challan_date >= cutoff_date)
#             .group_by(month_expr)
#             .order_by(month_expr)
#         )

#         # ---- 3) Execute (only 3 total DB hits) ----

#         challan_count = (await session.execute(challan_count_stmt)).scalar() or 0
#         items_count = (await session.execute(items_stmt)).scalar() or 0
#         rolling_rows = (await session.execute(rolling_stmt)).all()

#         return {
#             "challan_count": challan_count,
#             "items_count": items_count,
#             "rolling": [
#                 {
#                     "month": r.month,
#                     "total_challans": r.total_challans,
#                     "total_quantity": r.total_quantity,
#                 }
#                 for r in rolling_rows
#             ],
#         }

#     # ---------------------------
#     # GROUP 4 — WARRANTY
#     # ---------------------------
#     async def warranty_overview(self, session: AsyncSession):
#         """
#         Returns:
#         {
#             "pending_completed": [{"division":..., "final_status":..., "count":...}, ...],
#             "heads": {"replace": int, "repair": int},
#             "srf_delivery": [{"srf_number":..., "srf_date":..., "delivery_date":...}, ...]
#         }
#         """
#         appl_divisions = [
#             "SDA",
#             "IWH",
#             "SWH",
#             "COOLER",
#             "OTHERS",
#             "LIGHT",
#             "FANS",
#             "PUMP",
#             "ALTERNATOR",
#             "HT MOTOR",
#         ]

#         division_label = case(
#             (Warranty.division.in_(appl_divisions), "OTHERS"), else_=Warranty.division
#         ).label("division")

#         pending_stmt = (
#             select(division_label, Warranty.final_status, func.count().label("count"))
#             .group_by(division_label, Warranty.final_status)
#             .order_by(division_label)
#         )

#         heads_stmt = select(
#             func.count(case((Warranty.head == "REPLACE", 1))).label("replace_count"),
#             func.count(case((Warranty.head == "REPAIR", 1))).label("repair_count"),
#         )

#         today = date.today()
#         sixty_days_ago = today - timedelta(days=60)
#         srf_stmt = (
#             select(
#                 Warranty.srf_number,
#                 Warranty.srf_date,
#                 Warranty.delivery_date,
#             )
#             .where(
#                 Warranty.srf_date.isnot(None),
#                 Warranty.delivery_date.isnot(None),
#                 Warranty.srf_date >= sixty_days_ago,
#                 Warranty.srf_number.like("R_____/1"),
#             )
#             .order_by(Warranty.srf_date)
#             .limit(25)
#         )

#         pending_rows = (await session.execute(pending_stmt)).all()
#         heads_row = (await session.execute(heads_stmt)).mappings().first() or {}
#         srf_rows = (await session.execute(srf_stmt)).all()

#         return {
#             "pending_completed": [
#                 {"division": division, "final_status": final_status, "count": count}
#                 for division, final_status, count in pending_rows
#             ],
#             "heads": {
#                 "replace": heads_row.get("replace_count", 0),
#                 "repair": heads_row.get("repair_count", 0),
#             },
#             "srf_delivery": [
#                 {
#                     "srf_number": r.srf_number,
#                     "srf_date": r.srf_date.isoformat(),
#                     "delivery_date": r.delivery_date.isoformat(),
#                 }
#                 for r in srf_rows
#             ],
#         }

#     # ---------------------------
#     # GROUP 5 — OUT-OF-WARRANTY
#     # ---------------------------
#     async def out_of_warranty_overview(self, session: AsyncSession):
#         """
#         Returns:
#         {
#             "pending_completed": [{"division":..., "status":..., "count":...}, ...],
#             "count": int,
#             "srf_repair_delivery": [{"srf_number":..., "srf_date":..., "repair_date":..., "delivery_date":...}, ...]
#         }
#         """
#         appl_divisions = [
#             "SDA",
#             "IWH",
#             "SWH",
#             "COOLER",
#             "OTHERS",
#             "LIGHT",
#             "FANS",
#             "ALTERNATOR",
#             "HT MOTOR",
#         ]

#         division_label = case(
#             (OutOfWarranty.division.in_(appl_divisions), "OTHERS"),
#             else_=OutOfWarranty.division,
#         ).label("division")

#         status_case = case(
#             (OutOfWarranty.final_status == "Y", "COMPLETED"),
#             else_="PENDING",
#         ).label("status")

#         pending_stmt = (
#             select(division_label, status_case, func.count().label("count"))
#             .group_by(division_label, status_case)
#             .order_by(division_label)
#         )

#         count_stmt = select(func.count(OutOfWarranty.srf_number))

#         today = date.today()
#         sixty_days_ago = today - timedelta(days=60)
#         srf_stmt = (
#             select(
#                 OutOfWarranty.srf_number,
#                 OutOfWarranty.srf_date,
#                 OutOfWarranty.repair_date,
#                 OutOfWarranty.delivery_date,
#             )
#             .where(
#                 OutOfWarranty.srf_date.isnot(None),
#                 OutOfWarranty.repair_date.isnot(None),
#                 OutOfWarranty.delivery_date.isnot(None),
#                 OutOfWarranty.srf_date >= sixty_days_ago,
#                 OutOfWarranty.srf_number.like("S_____/1"),
#             )
#             .order_by(OutOfWarranty.srf_number)
#             .limit(25)
#         )

#         pending_rows = (await session.execute(pending_stmt)).all()
#         count_value = (await session.execute(count_stmt)).scalar() or 0
#         srf_rows = (await session.execute(srf_stmt)).all()

#         return {
#             "pending_completed": [
#                 {"division": division, "status": status, "count": count}
#                 for division, status, count in pending_rows
#             ],
#             "count": count_value,
#             "srf_repair_delivery": [
#                 {
#                     "srf_number": r.srf_number,
#                     "srf_date": r.srf_date.isoformat(),
#                     "repair_date": r.repair_date.isoformat(),
#                     "delivery_date": r.delivery_date.isoformat(),
#                 }
#                 for r in srf_rows
#             ],
#         }

#     # ---------------------------
#     # VENDOR (grouped — status + total)
#     # ---------------------------

#     async def vendor_overview(self, session: AsyncSession):
#         """
#         Returns:
#         {
#             "status_list": [
#                 {
#                 "division": "...",
#                 "source": "WARRANTY" | "OUT_OF_WARRANTY",
#                 "vendor_settled": "Y" | "N",
#                 "count": int
#                 },
#                 ...
#             ],
#             "total_vendors": int
#         }
#         """

#         # Total vendors (unchanged)
#         warranty_count = (
#             await session.execute(select(func.count()).where(Warranty.challan == "Y"))
#         ).scalar() or 0

#         outwarranty_count = (
#             await session.execute(
#                 select(func.count()).where(OutOfWarranty.challan == "Y")
#             )
#         ).scalar() or 0

#         total_vendors = warranty_count + outwarranty_count

#         # Warranty
#         warranty_stmt = (
#             select(
#                 Warranty.division.label("division"),
#                 literal("WARRANTY").label("source"),
#                 Warranty.vendor_settled.label("vendor_settled"),
#                 func.count().label("count"),
#             )
#             .where(Warranty.challan == "Y")
#             .group_by(Warranty.division, Warranty.vendor_settled)
#         )

#         # Out of Warranty
#         outwarranty_stmt = (
#             select(
#                 OutOfWarranty.division.label("division"),
#                 literal("OUT_OF_WARRANTY").label("source"),
#                 OutOfWarranty.vendor_settled.label("vendor_settled"),
#                 func.count().label("count"),
#             )
#             .where(OutOfWarranty.challan == "Y")
#             .group_by(OutOfWarranty.division, OutOfWarranty.vendor_settled)
#         )

#         rows = (await session.execute(warranty_stmt.union_all(outwarranty_stmt))).all()

#         # Division mapping (same as before)
#         def map_division(d):
#             if d in ("LIGHT", "SDA", "OTHERS", "COOLER", "IWH", "SWH", "ALTERNATOR"):
#                 return "OTHERS"
#             return d

#         status_list = [
#             {
#                 "division": map_division(r.division),
#                 "source": r.source,
#                 "vendor_settled": r.vendor_settled,
#                 "count": r.count,
#             }
#             for r in rows
#         ]

#         return {
#             "status_list": status_list,
#             "total_vendors": total_vendors,
#         }
