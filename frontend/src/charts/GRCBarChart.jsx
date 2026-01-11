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

const GRCBarChart = ({ data, className = "" }) => {
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
        borderWidth: 0.5,
        borderRadius: 6,
        maxBarThickness: 48, // Thicker bars
        minBarLength: 16,
        categoryPercentage: 0.7,
        barPercentage: 0.8,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Count : ${context.parsed.x}`;
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
    layout: {
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          display: false,
          color: "#0f172a",
        },
        min: 0,
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          color: "#0f172a",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutBounce",
    },
  };

  // Dynamically set chart height based on number of bars
  // Each bar gets 48px, min 200px, max 500px
  const barHeight = 48;
  const minHeight = 200;
  const maxHeight = 500;
  const dynamicHeight = Math.min(
    Math.max(chartData.length * barHeight, minHeight),
    maxHeight,
  );

  return (
    <div
      className={`rounded-lg flex flex-col w-full min-w-0 min-h-0 overflow-hidden max-h-full flex-1 ${className}`}
      style={{
        padding: 0,
        height: dynamicHeight,
        fontFamily: "'Poppins', 'Inter', 'Segoe UI', 'Arial', sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <div
        className="relative w-full flex justify-center items-center overflow-hidden min-w-0 min-h-0 flex-1"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          padding: 0,
          margin: 0,
          height: "100%",
        }}
      >
        <Bar data={chartDataObj} options={options} />
      </div>
    </div>
  );
};

export default GRCBarChart;
