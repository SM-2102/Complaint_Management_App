// Warranty Division Bar Chart
import React, { useEffect, useState, useLayoutEffect } from "react";
// Accepts: [{ division, Y, N }, ...]
const ComplaintStatusChart = ({ data }) => {
  // Directly use the data prop as chartData
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (Array.isArray(data)) {
      const merged = {};
      data.forEach(({ division, Y = 0, N = 0 }) => {
        if (!merged[division]) {
          merged[division] = { division, Y: 0, N: 0 };
        }
        merged[division].Y += Y || 0;
        merged[division].N += N || 0;
      });
      setChartData(Object.values(merged));
    } else {
      setChartData([]);
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

  // Animation state for each bar: animate purple first, then red
  const [barStates, setBarStates] = useState([]);
  const animationRanRef = React.useRef("");
  useLayoutEffect(() => {
    const chartKey = JSON.stringify(chartData);
    if (animationRanRef.current === chartKey) return;

    animationRanRef.current = chartKey;

    // Reset before paint
    setBarStates(chartData.map(() => ({ purple: false, yellow: false })));

    // Start all purple together
    const purpleTimer = setTimeout(() => {
      setBarStates((prev) => prev.map((s) => (s ? { ...s, purple: true } : s)));
    }, 50);

    // Then all yellow together
    const yellowTimer = setTimeout(() => {
      setBarStates((prev) => prev.map((s) => (s ? { ...s, yellow: true } : s)));
    }, 700);

    return () => {
      clearTimeout(purpleTimer);
      clearTimeout(yellowTimer);
    };
  }, [chartData]);

  const rows = chartData.length || 1;
  const containerHeight = 235;

  const MIN_BAR = 18;
  const MAX_BAR = 35;
  const MIN_GAP = 2;
  const MAX_GAP = 20;

  const idealBar = Math.min(
    Math.max((containerHeight / rows) * 0.6, MIN_BAR),
    MAX_BAR,
  );
  let remaining = containerHeight - idealBar * rows;

  let gap = rows > 1 ? remaining / (rows - 1) : 0;
  gap = Math.min(Math.max(gap, MIN_GAP), MAX_GAP);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        marginTop: 10,
        padding: "0 8px 12px 0",
        width: "100%",
        height: 250,
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

      <div className="flex flex-row items-start justify-start gap-0 w-full h-full">
        {/* Horizontal bars and labels */}
        <div
          className="flex flex-col w-full min-w-0 overflow-hidden"
          style={{
            height: "100%",
            rowGap: `${gap}px`,
          }}
        >
          {chartData.map((item, idx) => {
            const total = (item.Y || 0) + (item.N || 0);
            const yPercentage = total > 0 ? (item.Y / total) * 100 : 0;
            const nPercentage = total > 0 ? (item.N / total) * 100 : 0;
            const barState = barStates[idx] || { purple: false, yellow: false };
            return (
              <div key={item.division} className="flex items-center">
                {/* Fixed width label */}
                <span
                  className="text-[10px] font-semibold text-gray-700 text-right mr-1"
                  style={{
                    width: "42px",
                    flexShrink: 0,
                    display: "inline-block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.division}
                </span>
                {/* Stacked horizontal bar: purple left, red right */}
                <div
                  className="relative flex flex-row w-full rounded overflow-hidden"
                  style={{ height: `${idealBar}px` }}
                >
                  {/* Completed (Y) - purple left */}
                  <div
                    className="bg-purple-500 h-full transition-all duration-700 cursor-pointer relative"
                    style={{
                      width: barState.purple ? `${yPercentage}%` : 0,
                      transitionDelay: "0ms",
                    }}
                    onMouseOver={(e) =>
                      handleMouseOver(
                        e,
                        `${yPercentage.toFixed(1)}%`,
                        "Completed",
                        item.Y,
                      )
                    }
                    onMouseOut={handleMouseOut}
                  ></div>
                  {/* Pending (N) - red right */}
                  <div
                    className="bg-yellow-500 h-full transition-all duration-700 cursor-pointer relative"
                    style={{
                      width: barState.yellow ? `${nPercentage}%` : 0,
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

export default ComplaintStatusChart;
