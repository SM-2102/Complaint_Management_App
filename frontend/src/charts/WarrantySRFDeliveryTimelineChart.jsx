// SRF vs Delivery Timeline Chart
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from "recharts";

const WarrantySRFDeliveryTimelineChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data?.warranty?.srf_vs_delivery_month_wise_bar_graph) {
      const timelineData =
        data.warranty.srf_vs_delivery_month_wise_bar_graph.map((item) => {
          const srfDate = new Date(item.srf_date);
          const deliveryDate = new Date(item.delivery_date);
          const daysDiff = Math.ceil(
            (deliveryDate - srfDate) / (1000 * 60 * 60 * 24),
          );
          return {
            ...item,
            daysDifference: daysDiff,
          };
        });
      setChartData(timelineData);
    } else {
      setChartData([]);
    }
  }, [data]);

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      // Format dates for display as dd-mm-yy
      const formatDMY = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (isNaN(d)) return "-";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      };
      const srfDate = formatDMY(item.srf_date);
      const deliveryDate = formatDMY(item.delivery_date);
      return (
        <div
          className="px-3 py-2 rounded-lg shadow-xl text-xs bg-white font-semibold text-gray-900 border border-gray-200"
          style={{
            minWidth: 120,
            textAlign: "center",
            letterSpacing: "0.01em",
          }}
        >
          <span className="block text-blue-700 font-bold mb-1">
            {item.srf_number}
          </span>
          <span className="block">
            Delivered in{" "}
            <span className="font-bold text-gray-800">
              {item.daysDifference} days
            </span>
          </span>
          <span className="block mt-1 text-gray-600">
            SRF Date:{" "}
            <span className="font-normal text-gray-800">{srfDate}</span>
          </span>
          <span className="block text-gray-600">
            Delivery Date:{" "}
            <span className="font-normal text-gray-800">{deliveryDate}</span>
          </span>
        </div>
      );
    }
    return null;
  };

  // Color function for each point
  const getPointColor = (days) => {
    if (days <= 7) return "#22c55e"; // green-500
    if (days <= 14) return "#eab308"; // yellow-500
    if (days <= 21) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-[#fff7e6]">
        <span className="text-gray-500 text-sm">Loading chart...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: 205,
        minWidth: 0,
        minHeight: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        marginTop: "10px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 4, left: 0, bottom: 10 }}
        >
          <YAxis
            tick={{ fontSize: 12 }}
            allowDataOverflow={true}
            width={22}
            padding={{ top: 0, bottom: 5 }}
            domain={[() => 0, (dataMax) => dataMax + 1]}
          />

          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="daysDifference"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={({ cx, cy, payload }) => (
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={getPointColor(payload.daysDifference)}
                stroke="#fff"
                strokeWidth={1}
              />
            )}
            activeDot={{
              r: 8,
              stroke: "#6366f1",
              strokeWidth: 2,
              fill: "#fff",
            }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WarrantySRFDeliveryTimelineChart;
