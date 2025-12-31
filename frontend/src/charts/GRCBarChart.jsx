// Division-wise Donut Chart for Retail Data
import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale);

const GRCBarChart = ({ data }) => {
  // 'data' is expected to be an array of { division, count }
  const chartData = Array.isArray(data) ? data : [];
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
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function () {
            return ""; // Remove tooltip label as well
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
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false, // Hide x-axis count numbers
          color: "#0f172a",
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: true, // Show y-axis division labels
          color: "#0f172a",
        },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutBounce",
    },
  };

  return (
    <div className="p-1 md:p-1 rounded-lg flex flex-col items-center w-full min-w-0 overflow-hidden max-h-full">
      <div
        className="relative w-full flex items-center justify-center overflow-hidden min-w-0 min-h-0"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        <Bar
          data={chartDataObj}
          options={options}
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default GRCBarChart;
