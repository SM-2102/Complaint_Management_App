import React, { useEffect, useRef, useState } from "react";

// Simple confetti animation using CSS (slower fall, more confetti)
const Confetti = () => (
  <div className="birthday-confetti">
    {[...Array(80)].map((_, i) => (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${Math.random() * 100}vw`,
          background: `hsl(${Math.random() * 360}, 80%, 60%)`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))}
    <style>{`
      .birthday-confetti {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none;
        z-index: 40;
      }
      .confetti-piece {
        position: absolute;
        top: 0;
        width: 10px;
        height: 20px;
        opacity: 0.8;
        border-radius: 3px;
        animation: confetti-fall 3s linear infinite;
      }
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(90vh) rotate(360deg); }
      }
    `}</style>
  </div>
);

function BirthdayWish({ names = [], onDone }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const greeting = names.length > 0 ? "Happy Birthday" : "";
  if (!names || names.length === 0 || !visible) return null;
  const allLines = [greeting, ...names, "Enjoy your special day"].filter(
    Boolean,
  );
  const lines = allLines;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        if (onDone) onDone();
      }, 700); // match transition duration
    }, 4000);
    return () => clearTimeout(timer);
  }, [names, onDone]);

  return (
    <div
      className={fadeOut ? "birthday-fade-out" : ""}
      style={{
        position: "fixed",
        top: 20,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 30,
        background: "rgba(37, 99, 235, 0.25)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        pointerEvents: "none",
        transition: "opacity 0.7s",
      }}
    >
      <Confetti />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "1rem 2rem",
          borderRadius: "1rem",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#a259e6",
          textShadow: "0 2px 16px #fff, 0 0px 4px #eab308",
          zIndex: 50,
          whiteSpace: "pre-line",
          pointerEvents: "none",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "3px solid #3c13adff",
          background: "rgba(255,255,255,0.85)",
          textAlign: "center",
        }}
        className="birthday-typewriter fancy-birthday"
      >
        <div style={{ display: "inline-block", textAlign: "center" }}>
          {lines.map((line, idx) => {
            if (idx === 0) {
              // Greeting
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "3.2rem",
                  }}
                >
                  <span
                    className="animated-celebration-emoji"
                    style={{
                      fontSize: "2.7rem",
                      marginRight: 8,
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    🎉
                  </span>
                  <span
                    style={{
                      fontFamily: '"Pacifico", "Comic Sans MS", cursive',
                      fontSize: "2.7rem",
                      color: "#2c1750ff",
                      letterSpacing: "2px",
                      textShadow: "0 2px 16px #fff, 0 0px 4px #2563eb",
                      fontWeight: 700,
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    {line}
                  </span>
                  <span
                    className="animated-celebration-emoji"
                    style={{
                      fontSize: "2.7rem",
                      marginLeft: 8,
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    🎉
                  </span>
                </div>
              );
            } else if (idx > 0 && idx <= names.length) {
              // Names
              return (
                <div
                  key={idx}
                  style={{
                    fontFamily:
                      '"Lobster", "Caveat", "Brush Script MT", cursive',
                    fontSize: "2.7rem",
                    color: "#753caaff",
                    letterSpacing: "1.5px",
                    textShadow: "0 2px 16px #fff, 0 0px 4px #eab308",
                    fontWeight: 700,
                    marginTop: 10,
                    lineHeight: 1.2,
                    minHeight: "3.2rem",
                  }}
                >
                  {line}
                </div>
              );
            } else if (idx === names.length + 1) {
              // Final line
              return (
                <div
                  key={idx}
                  style={{
                    fontSize: "2.2rem",
                    color: "#1b9b4aff",
                    marginTop: "1.5rem",
                    fontFamily: "cursive",
                    textAlign: "center",
                    minHeight: "2.5rem",
                  }}
                >
                  <span
                    className="animated-cake-emoji"
                    style={{
                      fontSize: "2.2rem",
                      marginRight: 8,
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    🎂
                  </span>
                  {line}
                  <span
                    className="animated-cake-emoji"
                    style={{
                      fontSize: "2.2rem",
                      marginLeft: 8,
                      display: "inline-block",
                      verticalAlign: "middle",
                    }}
                  >
                    🎂
                  </span>
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
      <style>{`
        .birthday-fade-out {
          opacity: 0 !important;
          pointer-events: none;
          transition: opacity 0.7s cubic-bezier(.4,0,.2,1);
        }
        .birthday-typewriter {
          animation: fade-in 0.7s;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .greeting-animated {
          animation: fade-in-up 1.1s 0.1s both cubic-bezier(.23,1.01,.32,1);
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .typewriter-cursor {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to { opacity: 0; }
        }
        .fancy-birthday {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: 3px solid #a259e6;
        }
        .animated-celebration-emoji {
          animation: pop-celebration-emoji 1.2s infinite cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes pop-celebration-emoji {
          0%, 100% { transform: scale(1) rotate(-10deg); }
          20% { transform: scale(1.2) rotate(10deg); }
          40% { transform: scale(1.1) rotate(-10deg); }
          60% { transform: scale(1.2) rotate(10deg); }
          80% { transform: scale(1.1) rotate(-10deg); }
        }
        .animated-cake-emoji {
          animation: bounce-cake-emoji 1.5s infinite cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes bounce-cake-emoji {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
          50% { transform: translateY(-5px); }
          70% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}

export default BirthdayWish;
