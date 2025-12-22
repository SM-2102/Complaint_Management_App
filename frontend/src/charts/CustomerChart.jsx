// Chart for Customer Card

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const stylishFont = {
  fontFamily: 'Poppins, Montserrat, "Segoe UI", Arial, sans-serif',
  letterSpacing: "0.03em",
};

const gradientTextStyle = {
  background: "linear-gradient(90deg, #ff416c 0%, #ff4b2b 50%, #ffa947ff 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 800,
  fontSize: "3rem",
  lineHeight: 1.1,
  letterSpacing: "0.04em",
  transition: "transform 0.2s",
};

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

const CustomerChart = ({ data }) => {
  // Static values (no animation)
  const customerCount = data?.customer?.number_of_customers || 0;
  const ascCount = data?.customer?.number_of_asc_names || 0;

  // Prepare top customers
  const topCustomersObj = data?.customer?.top_customers || {};
  const topCustomersArr = Object.entries(topCustomersObj)
    .map(([name, value]) => ({ name: toTitleCase(name), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {/* Customers Metric */}
      <div
        className="flex flex-row flex-nowrap items-end group transition-transform duration-200 hover:scale-105 ml-0 w-full max-w-[700px] px-2 whitespace-nowrap"
        style={{ minWidth: 0 }}
        tabIndex={0}
      >
        <span
          style={{
            ...gradientTextStyle,
            fontSize: "2rem",
            minWidth: 0,
            wordBreak: "break-word",
            flexShrink: 1,
          }}
          className="main-metric group-hover:scale-100 transition-transform duration-200"
        >
          {customerCount}+
        </span>
        <span
          className="text-xl md:text-2xl font-medium ml-3 truncate"
          style={{
            ...stylishFont,
            color: "#ff416c",
            fontWeight: 600,
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          Customers
        </span>
      </div>

      {/* ASC Names Metric */}
      <div
        className="flex flex-row flex-nowrap items-end group transition-transform duration-200 hover:scale-100 ml-8 w-full max-w-[700px] px-2 whitespace-nowrap"
        style={{ minWidth: 0 }}
        tabIndex={0}
      >
        <span
          style={{
            ...gradientTextStyle,
            fontSize: "1.3rem",
            minWidth: 0,
            wordBreak: "break-word",
            flexShrink: 1,
            background: "linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          className="main-metric group-hover:scale-100 transition-transform duration-200"
        >
          {ascCount}+
        </span>
        <span
          className="text-md md:text-md font-medium ml-2 truncate"
          style={{
            ...stylishFont,
            color: "#3a7bd5",
            fontWeight: 500,
            minWidth: 0,
            flexShrink: 1,
          }}
        >
          Authorized Service Centres
        </span>
      </div>

      {/* Top Customers Bar Chart */}
      {topCustomersArr.length > 0 && (
        <div className="w-full flex flex-col items-center justify-center">
          <div
            style={{
              width: "100%",
              height: 160,
              background: "#ffe4ec",
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "140%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 1,
                opacity: 0.7,
                fontSize: "2.5rem",
                fontWeight: 900,
                fontFamily: "Poppins, Montserrat, Segoe UI, Arial, sans-serif",
                color: "#3a7bd5",
                textAlign: "center",
                userSelect: "none",
                transform: "translate(-50%, -50%) rotate(-24deg)",
              }}
            >
              Top Customers
            </div>

            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                zIndex: 2,
              }}
            >
              <Bar
                data={{
                  labels: topCustomersArr.map((c) => c.name),
                  datasets: [
                    {
                      label: "Count",
                      data: topCustomersArr.map((c) => c.value),
                      backgroundColor: [
                        "rgba(255,65,108,0.70)",
                        "rgba(84, 213, 58, 0.7)",
                        "rgba(255,196,0,0.70)",
                        "rgba(0,210,255,0.70)",
                        "rgba(255,75,43,0.70)",
                      ],
                      borderRadius: 7,
                      borderSkipped: false,
                      maxBarThickness: 20,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 1200,
                    easing: "easeOutQuart",
                    delay: (ctx) => ctx.dataIndex * 180,
                  },
                  plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: (ctx) => `${ctx.parsed.x} Records`,
                      },
                      backgroundColor: "rgba(246,250,255,0.95)",
                      titleColor: "#021bacff",
                      bodyColor: "#203cdbff",
                      borderColor: "#0e095fff",
                      borderWidth: 1,
                      padding: 8,
                    },
                  },
                  scales: {
                    x: { display: false, grid: { display: false } },
                    y: {
                      grid: { display: false },
                      ticks: {
                        color: "#01010aff",
                        font: {
                          size: 11,
                          weight: "bold",
                          family:
                            "Poppins, Montserrat, Segoe UI, Arial, sans-serif",
                        },
                      },
                      afterFit: (axis) => {
                        axis.width += 20;
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .main-metric { text-shadow: 0 2px 12px rgba(255, 65, 108, 0.10); }
        .group:hover .main-metric { transform: scale(1.08); }
        canvas { border-radius: 16px; }
        @media (max-width: 600px) {
          .main-metric { font-size: 1.3rem !important; }
        }
      `}</style>
    </div>
  );
};

export default CustomerChart;
