// Complaint Type Pie Chart
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const COLORS = [
  "#0d1d39ff", // Blue
  "#2ec693ff", // Emerald
  "#f97316", // Orange
  "#ec4899", // Pink
];


const ComplaintTypePieChart = ({ data }) => {
  // expects: [{ type, count }, ...]
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setPieData({
        labels: data.map((d) => d.type),
        datasets: [
          {
            data: data.map((d) => d.count),
            backgroundColor: COLORS.slice(0, data.length),
            borderColor: "#fff",
            borderWidth: 0,
            hoverOffset: 16,
          },
        ],
      });
    } else {
      setPieData({ labels: [], datasets: [] });
    }
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (ctx) => ctx[0]?.label || "",
          label: function (context) {
            const value = context.parsed || 0;
            return `${value} complaints`;
          },
        },
        backgroundColor: "#fff",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#2563eb",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        bodyFont: {
          size: 12,
          weight: "bold",
        },
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
  };

  return (
    <div
      className="p-1 rounded-lg flex flex-col items-center w-full h-full min-h-0 min-w-0 overflow-hidden"
    >
      <div
        className="relative w-full aspect-square max-w-full flex items-center justify-center overflow-hidden mt-5"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        <Pie
          data={pieData}
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

export default ComplaintTypePieChart;
