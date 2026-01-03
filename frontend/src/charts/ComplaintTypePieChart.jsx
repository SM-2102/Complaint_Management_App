// Complaint Type Pie Chart
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const COLORS = ["#f5e20bff", "#d50505ff", "#f59e42", "#f472b6"];

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
      style={{ background: "#e7d7f8ff" }}
      className="p-3 rounded-lg flex flex-col items-center w-full h-full min-h-0 min-w-0 overflow-hidden"
    >
      <div
        className="relative w-full aspect-square max-w-full flex items-center justify-center overflow-hidden"
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
      {/* Custom legend below the chart, left-aligned, only color and label */}
      <div className="w-full mt-2 flex flex-col items-start">
        {pieData.labels.map((label, idx) => (
          <div key={label} className="flex items-center mb-1">
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                backgroundColor: COLORS[idx % COLORS.length],
                borderRadius: 4,
                marginRight: 8,
                border: "1px solid #ccc",
              }}
            ></span>
            <span
              className="text-xs font-medium text-gray-700"
              style={{ minWidth: 60 }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintTypePieChart;
