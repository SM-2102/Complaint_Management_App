// Warranty Division Bar Chart
import React, { useEffect, useState } from "react";
const WarrantyStatusChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data?.warranty?.division_wise_pending_completed_bar_graph) {
      // Group data by division
      const groupedData =
        data.warranty.division_wise_pending_completed_bar_graph.reduce(
          (acc, item) => {
            const division = item.division;
            if (!acc[division]) {
              acc[division] = { division, Y: 0, N: 0 };
            }
            acc[division][item.final_status] = item.count;
            return acc;
          },
          {},
        );
      setChartData(Object.values(groupedData));
    }
  }, [data]);

  // Tooltip state (must be before any return)
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

  // Animation state for each bar: animate green first, then red
  const [barStates, setBarStates] = useState([]);
  const animationRanRef = React.useRef("");
  useEffect(() => {
    const chartKey = JSON.stringify(chartData);
    if (animationRanRef.current === chartKey) return;
    animationRanRef.current = chartKey;
    setBarStates(chartData.map(() => ({ green: false, red: false })));
    chartData.forEach((_, idx) => {
      setTimeout(() => {
        setBarStates((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], green: true };
          return next;
        });
        setTimeout(() => {
          setBarStates((prev) => {
            const next = [...prev];
            if (next[idx]) next[idx] = { ...next[idx], red: true };
            return next;
          });
        }, 700);
      }, idx * 200);
    });
  }, [chartData]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        marginTop: "15px",
        padding: "0 8px 12px 0",
        width: "100%",
        height: 200,
        minWidth: 0,
        minHeight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
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
      {data?.warranty?.warranty_heads && (
        <div className="w-full flex flex-col items-center gap-3 mb-4 mt-3 ml-1 mr-1">
          {/* Repair */}
          <div
            className="
              flex flex-col items-center px-1 py-0.5 rounded-md w-fit
              bg-gradient-to-r from-pink-50 to-pink-100 
              border border-pink-300/60
              shadow-[0_2px_4px_rgba(0,0,0,0.08)]
              backdrop-blur-sm
            "
            style={{
              boxShadow:
                "inset 0 0 4px rgba(236,72,153,0.15), 0 2px 5px rgba(0,0,0,0.08)",
            }}
          >
            <span
              className="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa 
                text-pink-700 font-semibold 
                whitespace-nowrap
                text-[clamp(9px,1.6vw,14px)]
              "
            >
              {data.warranty.warranty_heads.repair} Items Repaired
            </span>
          </div>
          {/* Replace */}
          <div
            className="
              flex flex-col items-center px-1 py-0.5 rounded-md w-fit
              bg-gradient-to-r from-blue-50 to-blue-100 
              border border-blue-300/60 
              shadow-[0_2px_4px_rgba(0,0,0,0.08)]
              backdrop-blur-sm
            "
            style={{
              boxShadow:
                "inset 0 0 4px rgba(59,130,246,0.15), 0 2px 5px rgba(0,0,0,0.08)",
            }}
          >
            <span
              className="
                text-blue-700 font-semibold
                whitespace-nowrap
                text-[clamp(9px,1.6vw,14px)]
              "
            >
              {data.warranty.warranty_heads.replace < 2
                ? "No Items Replaced"
                : `${data.warranty.warranty_heads.replace} Items Replaced`}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-row items-start justify-start gap-0 w-full h-full">
        {/* Horizontal bars and labels */}
        <div
          className="flex flex-col gap-2 w-full min-w-0 overflow-y-auto"
          style={{ height: "100%" }}
        >
          {chartData.map((item, idx) => {
            const total = item.Y + item.N;
            const yPercentage = total > 0 ? (item.Y / total) * 100 : 0;
            const nPercentage = total > 0 ? (item.N / total) * 100 : 0;
            const barState = barStates[idx] || { green: false, red: false };
            return (
              <div key={item.division} className="flex items-center">
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
                {/* Stacked horizontal bar: green left, red right */}
                <div className="relative flex flex-row h-6 w-full rounded overflow-hidden">
                  {/* Completed (Y) - green left */}
                  <div
                    className="bg-green-500 h-full transition-all duration-700 cursor-pointer relative"
                    style={{
                      width: barState.green ? `${yPercentage}%` : 0,
                      transitionDelay: "0ms",
                    }}
                    onMouseOver={(e) =>
                      handleMouseOver(
                        e,
                        `${yPercentage.toFixed(1)}%`,
                        "Settled",
                        item.Y,
                      )
                    }
                    onMouseOut={handleMouseOut}
                  ></div>
                  {/* Pending (N) - red right */}
                  <div
                    className="bg-red-500 h-full transition-all duration-700 cursor-pointer relative"
                    style={{
                      width: barState.red ? `${nPercentage}%` : 0,
                      transitionDelay: "0ms",
                    }}
                    onMouseOver={(e) =>
                      handleMouseOver(
                        e,
                        `${nPercentage.toFixed(1)}%`,
                        "Pending",
                        item.N,
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
          .warranty-status-bar-label {
            font-size: 0.7rem;
            width: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WarrantyStatusChart;
