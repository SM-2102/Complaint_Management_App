import React, { useEffect, useState } from "react";

/**
 * Toast component
 * @param {string} message - The message to display
 * @param {string} resolution - Optional resolution message
 * @param {string} type - 'error' | 'success' | 'info' | 'warning'
 * @param {number} duration - Duration in ms (default: 1500)
 * @param {function} onClose - Callback when toast closes
 */
const Toast = ({
  message,
  resolution = "",
  type = "info",
  duration = 2000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  // Color and icon based on type
  const typeStyles = {
    error: {
      bg: "bg-red-600",
      border: "border-red-700",
      icon: (
        <svg
          className="w-5 h-5 text-white mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    success: {
      bg: "bg-green-600",
      border: "border-green-700",
      icon: (
        <svg
          className="w-5 h-5 text-white mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    info: {
      bg: "bg-blue-600",
      border: "border-blue-700",
      icon: (
        <svg
          className="w-5 h-5 text-white mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01"
          />
        </svg>
      ),
    },
    warning: {
      bg: "bg-yellow-500",
      border: "border-yellow-600",
      icon: (
        <svg
          className="w-5 h-5 text-white mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01"
          />
        </svg>
      ),
    },
  };
  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed top-14 left-1/2 transform -translate-x-1/2 z-50 min-w-[260px] max-w-xs px-4 py-3 rounded-lg shadow-lg flex items-start border-2 ${style.bg} ${style.border} animate-fade-in`}
      style={{ pointerEvents: "none" }}
    >
      <div className="flex-1">
        <span className="text-white font-semibold block text-base mb-0.5 justify-center flex items-center">
          {message}
        </span>
        {resolution && (
          <span className="text-white text-xs opacity-90 block mt-0.5 justify-center flex items-center">
            {resolution}
          </span>
        )}
      </div>
      {/* Progress bar animation */}
      <div className="absolute left-0 bottom-0 h-1 w-full">
        <div
          className="bg-white bg-opacity-60 h-full rounded-b-lg animate-toast-progress"
          style={{
            animationDuration: `${duration}ms`,
          }}
        ></div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes toast-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-toast-progress {
          animation: toast-progress linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
