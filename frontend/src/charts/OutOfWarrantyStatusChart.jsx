// Out of Warranty Final Status Chart
import React, { useEffect, useState, useRef } from "react";

const OutOfWarrantyStatusChart = ({ data, loading, error }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data?.out_of_warranty?.final_status_bar_graph) {
      // Group data by division
      const groupedData = data.out_of_warranty.final_status_bar_graph.reduce(
        (acc, item) => {
          const division = item.division;
          if (!acc[division]) {
            acc[division] = { division, COMPLETED: 0, PENDING: 0 };
          }
          acc[division][item.status] = item.count;
          return acc;
        },
        {},
      );

      setChartData(Object.values(groupedData));
    }
  }, [data]);

  // Tooltip state
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    value: "",
    label: "",
    count: null,
  });

  // Helper to show tooltip
  const handleMouseOver = (e, value, label, count) => {
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      value,
      label,
      count,
    });
  };
  const handleMouseOut = () => setTooltip({ ...tooltip, show: false });

  // Animation state for each bar: animate completed first, then pending
  const [barStates, setBarStates] = useState([]);
  const animationRanRef = useRef("");
  useEffect(() => {
    const chartKey = JSON.stringify(chartData);
    if (animationRanRef.current === chartKey) return;
    animationRanRef.current = chartKey;
    setBarStates(chartData.map(() => ({ completed: false, pending: false })));
    chartData.forEach((_, idx) => {
      setTimeout(() => {
        setBarStates((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], completed: true };
          return next;
        });
        setTimeout(() => {
          setBarStates((prev) => {
            const next = [...prev];
            if (next[idx]) next[idx] = { ...next[idx], pending: true };
            return next;
          });
        }, 700);
      }, idx * 200);
    });
  }, [chartData]);

  if (loading)
    return (
      <div className="text-center py-4">Loading out-of-warranty data...</div>
    );
  if (error)
    return (
      <div className="text-center py-4 text-red-500">
        Error loading out-of-warranty data
      </div>
    );

  return (
    <div className="w-full">
      {/* Frosted Card */}
      {data?.out_of_warranty?.out_of_warranty_count !== undefined && (
        <div className="w-full flex justify-center ml-2 mt-2">
          <div
            className="
    w-22 h-22
    flex flex-col items-center justify-center
    rounded-full
    text-center
    shadow-md
    text-white
    bg-[radial-gradient(circle,_#ff9f40_35%,_#dc2626_100%)]
  "
          >
            <div className="text-md font-extrabold">
              {data.out_of_warranty.out_of_warranty_count}+ Products
            </div>
            <div className="text-sm font-medium">Repaired</div>
          </div>
        </div>
      )}

      {/* Chart container (unchanged) */}
      <div className="flex flex-row items-start justify-end gap-0 w-full max-w-[350px]">
        {/* bars here */}
      </div>

      <div className="flex justify-center">
        {/* Tooltip */}
        {tooltip.show && (
          <div
            className="pointer-events-none fixed z-50 px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold bg-white text-gray-900 border border-gray-200"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y + 10,
              minWidth: 70,
              textAlign: "center",
              letterSpacing: "0.01em",
            }}
          >
            <span className="block">{tooltip.label}</span>
            <span className="block font-bold">
              {tooltip.value}
              {tooltip.count !== null && (
                <span className="ml-1 text-gray-500">({tooltip.count})</span>
              )}
            </span>
          </div>
        )}

        <div className="flex flex-row items-start justify-end gap-0 w-full max-w-[350px] pt-2">
          {/* Horizontal bars and labels */}
          <div className="flex flex-col gap-2 w-full min-w-0 overflow-y-auto">
            {chartData.map((item, idx) => {
              const total = item.COMPLETED + item.PENDING;
              const completedPercentage =
                total > 0 ? (item.COMPLETED / total) * 100 : 0;
              const pendingPercentage =
                total > 0 ? (item.PENDING / total) * 100 : 0;
              const barState = barStates[idx] || {
                completed: false,
                pending: false,
              };
              return (
                <div
                  key={item.division}
                  className="flex items-end justify-end w-full"
                >
                  {/* Fixed width label */}
                  <span
                    className="text-[10px] font-medium text-gray-700 text-right mr-1"
                    style={{
                      width: "57px",
                      flexShrink: 0,
                      display: "inline-block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.division}
                  </span>
                  {/* Stacked horizontal bar: blue left, orange right */}
                  <div className="relative flex flex-row h-4 w-full rounded overflow-hidden">
                    {/* Completed - blue left */}
                    <div
                      className="bg-blue-500 h-full transition-all duration-700 cursor-pointer relative"
                      style={{
                        width: barState.completed
                          ? `${completedPercentage}%`
                          : 0,
                        transitionDelay: "0ms",
                      }}
                      onMouseOver={(e) =>
                        handleMouseOver(
                          e,
                          `${completedPercentage.toFixed(1)}%`,
                          "Completed",
                          item.COMPLETED,
                        )
                      }
                      onMouseOut={handleMouseOut}
                    ></div>
                    {/* Pending - orange right */}
                    <div
                      className="bg-orange-500 h-full transition-all duration-700 cursor-pointer relative"
                      style={{
                        width: barState.pending ? `${pendingPercentage}%` : 0,
                        transitionDelay: "0ms",
                      }}
                      onMouseOver={(e) =>
                        handleMouseOver(
                          e,
                          `${pendingPercentage.toFixed(1)}%`,
                          "Pending",
                          item.PENDING,
                        )
                      }
                      onMouseOut={handleMouseOut}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <style>{`
        @media (max-width: 600px) {
          .out-of-warranty-bar-label {
            font-size: 0.7rem;
            width: 50px !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default OutOfWarrantyStatusChart;
