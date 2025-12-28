function YesNoToggle({ value, onChange, disabled }) {
  const isYes = value === "Y";

  const baseClasses =
    "w-28 text-center px-4 py-1 rounded-lg transition-all duration-300 font-medium";

  const activeClasses = isYes
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-red-500 hover:bg-red-600 text-white";

  const disabledClasses =
    "bg-gray-300 text-gray-400 cursor-not-allowed opacity-70 hover:bg-gray-300";

  return (
    <button
      type="button"
      onClick={() => onChange(isYes ? "N" : "Y")}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? disabledClasses : activeClasses}`}
      title={
        disabled ? "Available only for LT MOTOR / FHP MOTOR divisions" : ""
      }
    >
      {isYes ? "Yes" : "No"}
    </button>
  );
}

export default YesNoToggle;
