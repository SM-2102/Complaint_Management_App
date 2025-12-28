// Division-wise Donut Chart for Retail Data
import React, { useEffect, useState, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const RetailDivisionDonutChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (data?.retail?.division_wise_donut) {
      setChartData(data.retail.division_wise_donut);
    }
  }, [data]);

  useEffect(() => {
    const chartCanvas = chartRef.current?.querySelector("canvas");
    if (!chartCanvas) return;
    const handleEnter = () => setIsHovering(true);
    const handleLeave = () => setIsHovering(false);
    chartCanvas.addEventListener("mouseenter", handleEnter);
    chartCanvas.addEventListener("mouseleave", handleLeave);
    return () => {
      chartCanvas.removeEventListener("mouseenter", handleEnter);
      chartCanvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [chartRef.current]);

  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  const labels = chartData.map((item) => item.division);
  const dataValues = chartData.map((item) => item.count);
  const backgroundColors = [
    "#2563eb", // blue
    "#22c55e", // green
    "#eab308", // yellow
    "#a21caf", // purple
    "#ef4444", // red
    "#6366f1", // indigo
    "#ec4899", // pink
    "#6b7280", // gray
    "#f59e42", // orange
    "#14b8a6", // teal
  ];

  const chartDataObj = {
    labels,
    datasets: [
      {
        label: "Division Count",
        data: dataValues,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: "#fff",
        borderWidth: 0,
        hoverOffset: 16,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed || 0;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${value} (${percent}%)`;
          },
        },
        backgroundColor: "#fff",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#2563eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
      datalabels: {
        display: false,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: "easeOutBounce",
    },
    // Hide default segment value labels if present (Chart.js v4+)
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: "#fff",
        // Remove any default label rendering
        // Chart.js v4+ may use "labels" plugin for segment values
        // This disables it if present
        labels: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="p-2 md:p-3 rounded-lg flex flex-col items-center w-full min-w-0 overflow-hidden max-h-full">
      <div
        ref={chartRef}
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden min-w-0 min-h-0"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <Doughnut
          data={chartDataObj}
          options={options}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
        {total > 10 && !isHovering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            {/* Rounded number */}
            <span className="font-bold text-xl md:text-2xl text-blue-800 ml-1">
              {Math.floor(total / 10) * 10}+
            </span>

            {/* Subtext */}
            <span className="text-sm md:text-base font-medium text-gray-600 tracking-wider">
              Records
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailDivisionDonutChart;
