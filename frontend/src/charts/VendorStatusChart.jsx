import React, { useEffect, useState, useRef } from "react";

const VendorStatusChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  /* -------------------------------
     Data shaping
  -------------------------------- */
  useEffect(() => {
    const raw = data?.vendor?.status_per_division_stacked_bar_chart || [];

    const grouped = {};

    raw.forEach(({ division, source, vendor_settled, count }) => {
      if (!grouped[division]) {
        grouped[division] = {
          division,
          warranty: { Y: 0, N: 0 },
          outwarranty: { Y: 0, N: 0 },
        };
      }

      if (source === "WARRANTY") {
        grouped[division].warranty[vendor_settled] += count;
      } else {
        grouped[division].outwarranty[vendor_settled] += count;
      }
    });

    setChartData(Object.values(grouped));
  }, [data]);

  /* -------------------------------
     Tooltip
  -------------------------------- */
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    label: "",
    count: 0,
    percent: "",
  });

  const showTooltip = (e, label, count, percent) => {
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      label,
      count,
      percent,
    });
  };

  const hideTooltip = () => setTooltip((t) => ({ ...t, show: false }));

  /* -------------------------------
     Counter
  -------------------------------- */
  const StylishCounter = ({ total }) => (
    <div className="w-full flex justify-center mb-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-extrabold text-yellow-500">
          {total} +
        </span>
        <span className="text-md font-semibold text-purple-800">
          Products Challaned
        </span>
      </div>
    </div>
  );

  /* -------------------------------
     Animation control
  -------------------------------- */
  const [barStates, setBarStates] = useState([]);
  const animationKeyRef = useRef("");

  useEffect(() => {
    const key = JSON.stringify(chartData);
    if (animationKeyRef.current === key) return;

    animationKeyRef.current = key;

    setBarStates(
      chartData.map(() => ({
        wY: false,
        wN: false,
        owY: false,
        owN: false,
      })),
    );

    chartData.forEach((_, idx) => {
      setTimeout(() => {
        setBarStates((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx].wY = true;
          return next;
        });

        setTimeout(() => {
          setBarStates((prev) => {
            const next = [...prev];
            if (next[idx]) next[idx].wN = true;
            return next;
          });

          setTimeout(() => {
            setBarStates((prev) => {
              const next = [...prev];
              if (next[idx]) next[idx].owY = true;
              return next;
            });

            setTimeout(() => {
              setBarStates((prev) => {
                const next = [...prev];
                if (next[idx]) next[idx].owN = true;
                return next;
              });
            }, 300);
          }, 300);
        }, 300);
      }, idx * 200);
    });
  }, [chartData]);

  /* -------------------------------
     Render
  -------------------------------- */
  return (
    <div className="bg-[#f0f4f8] p-2 rounded-lg w-full overflow-x-auto">
      {data?.vendor?.total_vendors !== undefined && (
        <StylishCounter total={data.vendor.total_vendors} />
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed z-50 px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold bg-white border border-gray-200"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            minWidth: 90,
            textAlign: "center",
          }}
        >
          <div className="text-gray-700">{tooltip.label}</div>
          <div className="font-bold text-gray-900">
            {tooltip.percent}
            <span className="ml-1 text-gray-500">({tooltip.count})</span>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <div className="flex gap-4">
          {chartData.map((item, idx) => {
            const wTotal = item.warranty.Y + item.warranty.N;
            const owTotal = item.outwarranty.Y + item.outwarranty.N;

            const showWarranty = wTotal > 0;
            const showOW = owTotal > 0;

            const barCount = (showWarranty ? 1 : 0) + (showOW ? 1 : 0);

            const barWidth = barCount === 1 ? "w-16" : "w-8";

            const state = barStates[idx] || {};

            const pct = (v, t) => (t ? ((v / t) * 100).toFixed(1) : 0);

            return (
              <div key={item.division} className="flex flex-col items-center">
                {/* Bars */}
                <div className="flex gap-1 h-32">
                  {/* Warranty bar */}
                  {showWarranty && (
                    <div
                      className={`flex flex-col-reverse rounded overflow-hidden border border-gray-200 bg-gray-100 ${barWidth}`}
                    >
                      <div
                        className="bg-purple-600 transition-all duration-500"
                        style={{
                          height: state.wY
                            ? `${pct(item.warranty.Y, wTotal)}%`
                            : 0,
                        }}
                        onMouseOver={(e) =>
                          showTooltip(
                            e,
                            "Warranty – Settled",
                            item.warranty.Y,
                            `${pct(item.warranty.Y, wTotal)}%`,
                          )
                        }
                        onMouseOut={hideTooltip}
                      />
                      <div
                        className="bg-purple-300 transition-all duration-500"
                        style={{
                          height: state.wN
                            ? `${pct(item.warranty.N, wTotal)}%`
                            : 0,
                        }}
                        onMouseOver={(e) =>
                          showTooltip(
                            e,
                            "Warranty – Pending",
                            item.warranty.N,
                            `${pct(item.warranty.N, wTotal)}%`,
                          )
                        }
                        onMouseOut={hideTooltip}
                      />
                    </div>
                  )}

                  {/* Out of Warranty bar */}
                  {showOW && (
                    <div
                      className={`flex flex-col-reverse rounded overflow-hidden border border-gray-200 bg-gray-100 ${barWidth}`}
                    >
                      <div
                        className="bg-yellow-500 transition-all duration-500"
                        style={{
                          height: state.owY
                            ? `${pct(item.outwarranty.Y, owTotal)}%`
                            : 0,
                        }}
                        onMouseOver={(e) =>
                          showTooltip(
                            e,
                            "Out of Warranty – Settled",
                            item.outwarranty.Y,
                            `${pct(item.outwarranty.Y, owTotal)}%`,
                          )
                        }
                        onMouseOut={hideTooltip}
                      />
                      <div
                        className="bg-yellow-300 transition-all duration-500"
                        style={{
                          height: state.owN
                            ? `${pct(item.outwarranty.N, owTotal)}%`
                            : 0,
                        }}
                        onMouseOver={(e) =>
                          showTooltip(
                            e,
                            "Out of Warranty – Pending",
                            item.outwarranty.N,
                            `${pct(item.outwarranty.N, owTotal)}%`,
                          )
                        }
                        onMouseOut={hideTooltip}
                      />
                    </div>
                  )}
                </div>

                {/* Division label */}
                <span className="mt-1 text-[11px] font-medium text-gray-700 truncate w-16 text-center">
                  {item.division}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VendorStatusChart;
