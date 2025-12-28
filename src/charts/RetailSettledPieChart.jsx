// Settled vs Unsettled Pie Chart for Retail Data
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const RetailSettledPieChart = ({ data }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (data?.retail?.settled_vs_unsettled_pie_chart) {
      setChartData(data.retail.settled_vs_unsettled_pie_chart);
    }
  }, [data]);

  const total = Object.values(chartData).reduce((sum, value) => sum + value, 0);

  const settledValue = chartData.settled || 0;
  const settledPercent =
    total > 0 ? ((settledValue / total) * 100).toFixed(1) : 0;

  const statusData = [
    {
      label: "Not Received",
      value: chartData.not_received || 0,
      color: "#d50505ff",
    },
    {
      label: "Not Settled",
      value: chartData.received_not_settled || 0,
      color: "#f5e20bff",
    },
    {
      label: "To Settle",
      value: chartData.propose_for_settlement || 0,
      color: "#4c08eaff",
    },
    {
      label: "Settled",
      value: chartData.settled || 0,
      color: "#22c55e",
    },
  ];

  const pieData = {
    labels: statusData.map((s) => s.label),
    datasets: [
      {
        data: statusData.map((s) => s.value),
        backgroundColor: statusData.map((s) => s.color),
        borderColor: "#fff",
        borderWidth: 0,
        hoverOffset: 16,
      },
    ],
  };

  const centerTextPlugin = {
    id: "centerTextPlugin",
    afterDraw(chart) {
      const active = chart.getActiveElements();

      // Hide text when user hovers any slice
      if (active && active.length > 0) {
        return;
      }

      const { ctx, chartArea } = chart;
      const { left, right, top, bottom } = chartArea;

      const dataset = chart.data.datasets[0].data;

      const settledValue = dataset[3] || 0; // Settled slice
      const totalValue = dataset.reduce((a, b) => a + b, 0);

      const settledPercent =
        totalValue > 0 ? ((settledValue / totalValue) * 100).toFixed(1) : 0;

      const xCenter = (left + right) / 2;
      const yPosition = top + (bottom - top) * 0.75; // 75% vertical

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`${settledPercent}%`, xCenter, yPosition - 10);

      ctx.font = "400 14px sans-serif";
      ctx.fillText("Settled", xCenter, yPosition + 10);

      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: () => "",
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          },
        },
        backgroundColor: "#fff",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#22c55e",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        bodyFont: {
          size: 12,
          weight: "bold",
        },
      },
      datalabels: {
        display: false, // handled via center plugin
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
          // plugins={[centerTextPlugin]}
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

export default RetailSettledPieChart;
