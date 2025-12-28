// Division-wise Donut Chart for Stock Data
import React, { useEffect, useState, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const StockDivisionDonutChart = ({ data, meta }) => {
  const [chartData, setChartData] = useState(Array.isArray(data) ? data : []);
  const [isHovering, setIsHovering] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(data)) {
      setChartData(data);
    } else {
      setChartData([]);
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

  const total = chartData.reduce((sum, item) => sum + (item.count || 0), 0);
  const labels = chartData.map((item) => item.division);
  const dataValues = chartData.map((item) => item.count || 0);
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

  // Read totals from meta prop (passed by MenuDashboardPage)
  const totalStock = (typeof meta?.totalStock === 'number') ? meta.totalStock : 0;
  const totalGodown = (typeof meta?.totalGodown === 'number') ? meta.totalGodown : 0;
  const totalIssuedInAdvance = (typeof meta?.totalIssuedInAdvance === 'number') ? meta.totalIssuedInAdvance : 0;
  const totalUnderProcess = (typeof meta?.totalUnderProcess === 'number') ? meta.totalUnderProcess : 0;

  // Card styles (copied from ChallanChart)
  const stylishFont = {
    fontFamily: 'Poppins, Montserrat, "Segoe UI", Arial, sans-serif',
    letterSpacing: "0.03em",
  };
  const cardStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 24px rgba(118,75,162,0.15)",
    padding: "0.2rem 0.3rem",
    minWidth: "150px",
    textAlign: "center",
    fontFamily: stylishFont.fontFamily,
  };
  const numberStyle = {
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: "0.1rem 0 0.08rem 0",
    letterSpacing: "1px",
  };
  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: 400,
    opacity: 0.85,
    letterSpacing: "0.5px",
  };

  return (
    <div className=" rounded-lg flex flex-row items-center w-full min-w-0 overflow-hidden max-h-full">
      {/* Donut Chart */}
      <div
        ref={chartRef}
        className="relative flex items-center justify-center overflow-hidden min-w-0 min-h-0"
        style={{
          width: 260,
          height: 260,
          maxWidth: 260,
          maxHeight: 260,
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
      {/* Info Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "0.8rem",
          marginLeft: "1rem",
          minWidth: 150,
          marginTop: 8,
        }}
      >
        <div style={{ ...cardStyle, minWidth: 150, marginBottom: 0 }}>
          <div style={numberStyle}>{totalStock}+</div>
          <div style={labelStyle}>Items in Stock</div>
        </div>
        <div style={{ ...cardStyle, minWidth: 150, marginBottom: 0 }}>
          <div style={numberStyle}>{totalGodown}+</div>
          <div style={labelStyle}>Items in Godown</div>
        </div>
        <div style={{ ...cardStyle, minWidth: 150, marginBottom: 0 }}>
          <div style={numberStyle}>{totalIssuedInAdvance}+</div>
          <div style={labelStyle}>Items Issued in Advance</div>
        </div>
        <div style={{ ...cardStyle, minWidth: 150, marginBottom: 0 }}>
          <div style={numberStyle}>{totalUnderProcess}+</div>
          <div style={labelStyle}>Items Under Process</div>
        </div>
      </div>
    </div>
  );
};

export default StockDivisionDonutChart;
