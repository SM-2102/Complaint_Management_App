import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Custom Legend to place inside chart container
const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        borderRadius: 6,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        fontSize: 9,
        lineHeight: 1.5,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {payload &&
        payload.map((entry, idx) => (
          <span
            key={`legend-item-${idx}`}
            style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                backgroundColor: entry.color,
                borderRadius: 0,
                marginRight: 5,
              }}
            />
            {entry.value}
          </span>
        ))}
    </div>
  );
};

// Elegant date formatter: dd-mm-yy
const formatDMY = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="px-3 py-2 rounded-lg shadow-xl text-xs font-semibold bg-white text-gray-900 border border-gray-200"
        style={{
          minWidth: 140,
          textAlign: "center",
          letterSpacing: "0.01em",
        }}
      >
        <span className="block text-blue-700 font-bold mb-1">
          {data.srf_number}
        </span>
        <span className="block mt-1 text-gray-600">
          SRF Date:{" "}
          <span className="font-normal text-gray-800">
            {formatDMY(data.srf_date)}
          </span>
        </span>
        <span className="block text-gray-600">
          Repair Date:{" "}
          <span className="font-normal text-gray-800">
            {formatDMY(data.repair_date)}
          </span>
        </span>
        <span className="block text-gray-600">
          Delivery Date:{" "}
          <span className="font-normal text-gray-800">
            {formatDMY(data.delivery_date)}
          </span>
        </span>
      </div>
    );
  }
  return null;
};

const OutOfWarrantyTimeline = ({ data }) => {
  const chartRaw =
    data?.out_of_warranty?.srf_receive_vs_delivery_bar_graph || [];

  if (!Array.isArray(chartRaw) || chartRaw.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No timeline data available
      </div>
    );
  }
  // Prepare data for the chart
  const chartData = chartRaw.map((item) => ({
    srf_number: item.srf_number,
    srf_date: new Date(item.srf_date).getTime(),
    repair_date: new Date(item.repair_date).getTime(),
    delivery_date: new Date(item.delivery_date).getTime(),
    // Keep original strings for tooltip
    _srf_date: item.srf_date,
    _repair_date: item.repair_date,
    _delivery_date: item.delivery_date,
  }));
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 190,
        paddingTop: "7px",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="srf_number" hide />
          <YAxis type="number" domain={["auto", "auto"]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Line
            type="monotone"
            dataKey="srf_date"
            name="SRF Date"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{
              r: 3,
              stroke: "#8884d8",
              strokeWidth: 2,
              fill: "#8884d8",
            }}
          />
          <Line
            type="monotone"
            dataKey="repair_date"
            name="Repair Date"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{
              r: 3,
              stroke: "#82ca9d",
              strokeWidth: 2,
              fill: "#82ca9d",
            }}
          />
          <Line
            type="monotone"
            dataKey="delivery_date"
            name="Delivery Date"
            stroke="#ff7300"
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{
              r: 3,
              stroke: "#ff7300",
              strokeWidth: 2,
              fill: "#ff7300",
            }}
          />
          {/* Custom SVG axis lines overlay */}
          <g>
            <line
              x1="0"
              y1="100%"
              x2="100%"
              y2="100%"
              stroke="grey"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              stroke="grey"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OutOfWarrantyTimeline;
