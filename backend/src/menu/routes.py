import asyncio
import json
import os

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from auth.dependencies import AccessTokenBearer
from db.db import get_session

# from menu.service import MenuService

menu_router = APIRouter()
# menu_service = MenuService()
access_token_bearer = AccessTokenBearer()


"""
Returns dashboard data:
- number_of_customers,
- top_customers,
- number_of_challans,
- number_of_challan_items,
- challan_rolling_months,
- division_wise_donut_retail,
- settled_vs_unsettled_pie_chart_retail,
- division_wise_pending_completed_bar_graph_warranty,
- srf_vs_delivery_month_wise_bar_graph_warranty,
- srf_receive_vs_delivery_bar_graph_out_of_warranty,
- final_status_bar_graph_out_of_warranty.
"""


@menu_router.get("/dashboard", status_code=status.HTTP_200_OK)
async def get_dashboard_data(
    session: AsyncSession = Depends(get_session), _=Depends(access_token_bearer)
):
    # Simulating delay for testing loading states in frontend
    # # Use the grouped service methods (these each make multiple internal queries
    # # but significantly reduce number of round-trips overall).
    # master = await menu_service.master_overview(session)
    # retail = await menu_service.retail_overview(session)
    # challan = await menu_service.challan_overview(session)
    # warranty = await menu_service.warranty_overview(session)
    # ow = await menu_service.out_of_warranty_overview(session)
    # vendor = await menu_service.vendor_overview(session)

    # number_of_customers = master["master_count"]
    # number_of_asc_names = master["asc_count"]
    # top_customers = master["top_customers"]

    # retail_division_wise_data = retail["division_counts"]
    # retail_received_settled_unsettled = retail["pie"]

    # number_of_challan = challan["challan_count"]
    # challan_number_of_items = challan["items_count"]
    # challan_rolling_months = challan["rolling"]

    # vendor_status_per_division = vendor["status_list"]
    # total_vendors = vendor["total_vendors"]

    # warranty_pending_completed_per_division = warranty["pending_completed"]
    # warranty_srf_delivery = warranty["srf_delivery"]
    # warranty_heads = warranty["heads"]

    # ow_srf_repair_delivery = ow["srf_repair_delivery"]
    # ow_pending_completed_per_division = ow["pending_completed"]
    # ow_count = ow["count"]

    dashboard_data = {
        "customer": {
            "number_of_customers": 500,
            "number_of_asc_names": 0,
            "top_customers": {},
        },
        # "challan": {
        #     "number_of_challans": ((number_of_challan // 10) * 10),
        #     "number_of_items": ((challan_number_of_items // 10) * 10),
        #     "challan_rolling_months": challan_rolling_months,
        # },
        # "vendor": {
        #     "status_per_division_stacked_bar_chart": vendor_status_per_division,
        #     "total_vendors": ((total_vendors // 10) * 10),
        # },
        # "retail": {
        #     "division_wise_donut": retail_division_wise_data,
        #     "settled_vs_unsettled_pie_chart": retail_received_settled_unsettled,
        # },
        # "warranty": {
        #     "division_wise_pending_completed_bar_graph": warranty_pending_completed_per_division,
        #     "srf_vs_delivery_month_wise_bar_graph": warranty_srf_delivery,
        #     "warranty_heads": warranty_heads,
        # },
        # "out_of_warranty": {
        #     "srf_receive_vs_delivery_bar_graph": ow_srf_repair_delivery,
        #     "final_status_bar_graph": ow_pending_completed_per_division,
        #     "out_of_warranty_count": ((ow_count // 10) * 10),
        # },
        "stock": {
            "division_wise_donut" : {
                "CGCEL" : [
                    {"division" : "FH", "count" : 50},
                    {"division" : "sbjkd", "count" : 50}
                ],
                "CGPISL" : [
                    {"division" : "FH", "count" : 50},
                    {"division" : "skjd", "count" : 50}
                ],
            }
        }
    }
    return JSONResponse(content=dashboard_data)
