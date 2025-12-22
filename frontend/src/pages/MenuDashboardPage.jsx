import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import CustomerChart from "../charts/CustomerChart";
import ChallanChart from "../charts/ChallanChart";
import WarrantyStatusChart from "../charts/WarrantyStatusChart";
import OutOfWarrantyStatusChart from "../charts/OutOfWarrantyStatusChart";
import OutOfWarrantyTimeline from "../charts/OutOfWarrantyTimeline";
import WarrantySRFDeliveryTimelineChart from "../charts/WarrantySRFDeliveryTimelineChart";
import RetailDivisionDonutChart from "../charts/RetailDivisionDonutChart";
import RetailSettledPieChart from "../charts/RetailSettledPieChart";
import VendorStatusChart from "../charts/VendorStatusChart";
import { useDashboardData } from "../hooks/useDashboardData";
import SpinnerLoading from "../components/SpinnerLoading";
import { menuConfig } from "../config/menuConfig";

// Filter out actions with showInDashboard: false
// Pass all actions to MenuCard, but filter for overlay rendering
const cards = menuConfig.map(({ actions, ...rest }) => ({
  ...rest,
  actions,
  dashboardActions: actions.filter((a) => a.showInDashboard !== false),
}));

const MenuDashboardPage = () => {
  const { data, loading, error, refetch } = useDashboardData();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const openCardKey = queryParams.get("open") || null;

  const handleOpenCardKey = (key) => {
    const params = new URLSearchParams(location.search);
    if (key) {
      params.set("open", key);
    } else {
      params.delete("open");
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] pt-6 px-6 md:px-10 lg:px-20 bg-[#fff]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-grow min-w-0 w-full">
        {cards.map(
          ({ key, title, icon, actions, dashboardActions, bgColor }) => (
            <MenuCard
              key={key}
              cardKey={key}
              openCardKey={openCardKey}
              setOpenCardKey={handleOpenCardKey}
              title={title}
              icon={icon ? React.createElement(icon) : null}
              actions={actions}
              dashboardActions={dashboardActions}
              bgColor={bgColor}
              className="min-h-[300px] max-w-full w-full"
            >
              {/* ...existing chart rendering logic... */}
              {key === "customer" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Customer Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <CustomerChart data={data} />
                ))}
              {key === "challan" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Challan Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <ChallanChart data={data} />
                ))}
              {key === "retail" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Retail Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                    <div className="w-full md:px-0">
                      <RetailDivisionDonutChart data={data} />
                    </div>
                    <div className="w-full md:px-0">
                      <RetailSettledPieChart data={data} />
                    </div>
                  </div>
                ))}

              {key === "warranty" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Warranty Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                    <div className="w-full md:w-2/5 md:pr-0 md:px-0">
                      <WarrantyStatusChart data={data} />
                    </div>
                    <div className="w-full md:w-3/5 md:pl-0 md:px-0">
                      <WarrantySRFDeliveryTimelineChart data={data} />
                    </div>
                  </div>
                ))}
              {key === "vendor" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Vendor Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="mt-2">
                    <VendorStatusChart data={data} />
                  </div>
                ))}
              {key === "out_of_warranty" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Out of Warranty Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                    <div className="w-full md:w-2/3 md:pr-0 md:px-0">
                      <OutOfWarrantyTimeline data={data} />
                    </div>
                    <div className="w-full md:w-1/3 md:pl-0 md:px-0">
                      <OutOfWarrantyStatusChart data={data} />
                    </div>
                  </div>
                ))}
            </MenuCard>
          ),
        )}
      </div>
    </div>
  );
};

export default MenuDashboardPage;
