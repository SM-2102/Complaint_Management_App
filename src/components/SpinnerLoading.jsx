import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

/**
 * SpinnerLoading - A reusable loading spinner with optional text.
 * @param {string} text - Optional loading text to display below the spinner.
 */
const SpinnerLoading = ({ text = "Loading Data ..." }) => (
  <div className="flex flex-col items-center justify-center space-y-6 mb-10">
    <BiLoaderAlt className="w-8 h-8 text-blue-600 animate-spin" />
    <div className="relative">
      <span className="text-sm font-medium text-blue-600 inline-block animate-[pulse_2s_ease-in-out_infinite] opacity-100">
        {text}
      </span>
    </div>
  </div>
);

export default SpinnerLoading;
