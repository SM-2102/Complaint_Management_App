import React from "react";
import CountUp from "react-countup";
import {
  FaClipboardList,
  FaExclamationTriangle,
  FaStar,
  FaTools,
  FaEnvelope,
} from "react-icons/fa";

const cardMeta = [
  {
    icon: FaClipboardList,
    colorClass:
      "bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 border-blue-300 text-blue-900",
    title: "CRM Open Complaints",
  },
  {
    icon: FaExclamationTriangle,
    colorClass:
      "bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-200 border-yellow-300 text-yellow-900",
    title: "Escalation Complaints",
  },
  {
    icon: FaStar,
    colorClass:
      "bg-gradient-to-br from-pink-100 via-pink-50 to-pink-200 border-pink-300 text-pink-900",
    title: "High Priority Complaints",
  },
  {
    icon: FaTools,
    colorClass:
      "bg-gradient-to-br from-green-100 via-green-50 to-green-200 border-green-300 text-green-900",
    title: "Spare Pending Complaints",
  },
  {
    icon: FaEnvelope,
    colorClass:
      "bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 border-purple-300 text-purple-900",
    title: "Mails to be Sent",
  },
];

const ComplaintStatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div
    className={`flex flex-col items-center justify-start rounded-2xl border px-5 py-4 min-w-[140px] min-h-[100px] ${colorClass} transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl shadow-lg animate-fadeIn border-solid border-black/70 hover:border-primary-400`}
    style={{
      backdropFilter: "blur(2px)",
      boxShadow: "0 6px 32px 0 rgba(0,0,0,0.10)",
    }}
  >
    <span className="text-sm font-bold mb-2 opacity-90 tracking-wide text-center">
      {title}
    </span>
    <div className="flex flex-row items-center justify-center gap-3 w-full">
      <Icon className="text-4xl opacity-90 drop-shadow-md" />
      <span className="text-4xl font-extrabold text-center drop-shadow-sm animate-countUp">
        <CountUp end={value} duration={2} separator="," />
      </span>
    </div>
  </div>
);

// Add fadeIn and countUp animations via Tailwind (custom classes can be added in tailwind.config.js)

const ComplaintStatsCards = ({ stats, onCardClick }) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-6">
      {stats.map((stat, idx) => {
        const meta = cardMeta[idx];
        return (
          <div
            key={meta.title}
            style={{ cursor: onCardClick ? "pointer" : undefined }}
            onClick={() => onCardClick && onCardClick(stat.cardKey)}
          >
            <ComplaintStatCard
              title={meta.title}
              value={stat.value}
              icon={meta.icon}
              colorClass={meta.colorClass}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintStatsCards;
