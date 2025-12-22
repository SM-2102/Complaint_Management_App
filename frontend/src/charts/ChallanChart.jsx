// Chart for Challan Card
import React from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  Tooltip,
  Legend,
} from "recharts";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonthYear(ym) {
  if (!ym) return "";
  const [year, month] = ym.split("-");
  const mIdx = parseInt(month, 10) - 1;
  return `${monthNames[mIdx]} ${year}`;
}

function formatShortMonth(ym) {
  if (!ym) return "";
  const [, month] = ym.split("-");
  const mIdx = parseInt(month, 10) - 1;
  return shortMonthNames[mIdx];
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #764ba222",
        padding: "0.45rem 0.7rem",
        fontFamily: stylishFont.fontFamily,
        fontSize: "0.82rem",
        color: "#333",
        minWidth: 0,
        lineHeight: 1.3,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          color: "#764ba2",
          fontSize: "0.92rem",
          marginBottom: 2,
          fontFamily: stylishFont.fontFamily,
        }}
      >
        {formatMonthYear(label)}
      </div>
      {payload.map((entry, idx) => (
        <div
          key={idx}
          style={{ display: "flex", alignItems: "center", marginBottom: 2 }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.color,
              marginRight: 6,
            }}
          />
          <span style={{ fontWeight: 500, marginRight: 4 }}>{entry.name}:</span>
          <span style={{ fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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
  minWidth: "100px",
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

const ChallanChart = ({ data }) => {
  const totalChallans = data?.challan?.number_of_challans || 0;
  const totalItems = data?.challan?.number_of_items || 0;
  const months = data?.challan?.challan_rolling_months || [];

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "0.5rem auto" }}>
      {/* Info Cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginBottom: "0.5rem",
          maxWidth: 340,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div style={{ ...cardStyle, flex: 1 }}>
          <div style={numberStyle}>{totalChallans}+</div>
          <div style={labelStyle}>Total Challans</div>
        </div>
        <div style={{ ...cardStyle, flex: 1 }}>
          <div style={numberStyle}>{totalItems}+</div>
          <div style={labelStyle}>Total Items Dispatched</div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          background: "#faf6c0ff",
          margin: "0 0.5rem",
          minWidth: 0,
        }}
      >
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={months} margin={{ right: 20, top: 10 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 14 }}
              tickFormatter={formatShortMonth}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              wrapperStyle={{
                right: 0,
                top: 60,
                fontSize: "0.9rem",
                fontFamily: stylishFont.fontFamily,
              }}
            />
            <Bar
              yAxisId="right"
              dataKey="total_challans"
              name="Challans"
              fill="#667eea"
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="total_quantity"
              name="Quantity"
              stroke="#764ba2"
              strokeWidth={3}
              dot={{ r: 4, fill: "#fff", stroke: "#764ba2", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#764ba2" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChallanChart;
