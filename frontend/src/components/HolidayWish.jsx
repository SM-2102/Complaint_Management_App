import React from "react";

function HolidayWish({ holiday }) {
  if (!holiday) return null;
  return (
    <div
      className="holiday-fade-in"
      style={{
        position: "fixed",
        top: 20,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 29,
        background: "rgba(139, 92, 246, 0.13)", // light purple
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.7s",
      }}
    >
      <div
        style={{
          padding: "1.2rem 2.2rem",
          borderRadius: "1rem",
          fontSize: "2.2rem",
          fontWeight: "bold",
          color: "#382657ff", // purple-600
          textShadow: "0 2px 16px #fff, 0 0px 4px #7c3aed",
          zIndex: 50,
          background: "rgba(245,240,255,0.97)", // very light purple
          border: "2.5px solid #651799ff", // purple-300
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(124,58,237,0.10)",
        }}
      >
        <span
          className="holiday-animated-emoji"
          style={{
            fontSize: "2.2rem",
            marginRight: 8,
            display: "inline-block",
            verticalAlign: "middle",
          }}
        >
          🎉
        </span>
        <span
          className="holiday-title-animated"
          style={{ display: "inline-block", verticalAlign: "middle" }}
        >
          {holiday.name}!
        </span>
        <span
          className="holiday-animated-emoji"
          style={{
            fontSize: "2.2rem",
            marginLeft: 8,
            display: "inline-block",
            verticalAlign: "middle",
          }}
        >
          🎉
        </span>
        <div
          style={{
            marginTop: "1.1rem",
            fontSize: "1.3rem",
            color: "#42158aff",
          }}
        >
          {holiday.details}
        </div>
      </div>
      <style>{`
        .holiday-fade-in {
          animation: holiday-fade-in 0.8s cubic-bezier(.4,0,.2,1);
        }
        @keyframes holiday-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        /* bounce removed */
        .holiday-animated-emoji {
          animation: holiday-emoji-pop 1.3s infinite cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes holiday-emoji-pop {
          0%, 100% { transform: scale(1) rotate(-8deg); }
          20% { transform: scale(1.25) rotate(8deg); }
          40% { transform: scale(1.1) rotate(-8deg); }
          60% { transform: scale(1.2) rotate(8deg); }
          80% { transform: scale(1.1) rotate(-8deg); }
        }
        .holiday-title-animated {
          animation: holiday-title-fade-in-up 1s 0.2s both cubic-bezier(.23,1.01,.32,1);
        }
        @keyframes holiday-title-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default HolidayWish;
