import React from "react";
import { IoMdArrowDropleft } from "react-icons/io";

const GoBackIcon = ({ onClick, title = "Go Back", className = "" }) => (
  <button
    className={`w-10 h-10 rounded-full bg-blue-900 hover:bg-blue-700 text-white transition-colors duration-200 focus:outline-none flex items-center justify-center ${className}`}
    onClick={onClick}
    title={title}
    aria-label={title}
    type="button"
  >
    <IoMdArrowDropleft className="text-8xl" />
  </button>
);

export default GoBackIcon;
