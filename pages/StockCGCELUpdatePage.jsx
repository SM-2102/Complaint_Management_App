import React, { useState, useRef } from "react";

import Toast from "../components/Toast";
import { stockCGCELListByDivision } from "../services/stockCGCELStockListByDivisionService";
import { FiSearch } from "react-icons/fi";
import { validateUpdate } from "../utils/stockCGCELUpdateValidation";
import { searchCGCELByCode } from "../services/stockCGCELSearchByCodeService";
import { searchCGCELByDescription } from "../services/stockCGCELSearchByDescriptionService";
import { updateCGCELStock } from "../services/stockCGCELUpdateService";

const initialForm = {
  division: "",
  spare_code: "",
  spare_description: "",
  cnf_qty: "",
  grc_qty: "",
  own_qty: "",
  qty: "",
  movement_type: "",
  remark: "",
};

const divisionOptions = ["FANS", "PUMP", "LIGHT", "SDA", "WHC", "LAPP"];

const StockCGCELUpdatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [spareList, setSpareList] = useState([]);
  const [spareCodeSuggestions, setSpareCodeSuggestions] = useState([]);
  const [spareDescriptionSuggestions, setSpareDescriptionSuggestions] =
    useState([]);
  const [showSpareCodeSuggestions, setShowSpareCodeSuggestions] =
    useState(false);
  const [showSpareDescriptionSuggestions, setShowSpareDescriptionSuggestions] =
    useState(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let newValue = value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
    setError((prev) => ({ ...prev, [name]: undefined }));

    if (name === "division") {
      setForm((prev) => ({ ...prev, spare_code: "", spare_description: "" }));
      setSpareList([]);
      setSpareCodeSuggestions([]);
      setSpareDescriptionSuggestions([]);
      setShowSpareCodeSuggestions(false);
      setShowSpareDescriptionSuggestions(false);
      if (newValue) {
        try {
          const data = await stockCGCELListByDivision(newValue);
          setSpareList(Array.isArray(data) ? data : []);
        } catch (err) {
          setSpareList([]);
        }
      }
    }

    if (name === "spare_code") {
      if (newValue.length > 0 && spareList.length > 0) {
        const filtered = spareList.filter((item) =>
          item.spare_code.toLowerCase().startsWith(newValue.toLowerCase()),
        );
        setSpareCodeSuggestions(filtered);
        setShowSpareCodeSuggestions(filtered.length > 0);
      } else {
        setShowSpareCodeSuggestions(false);
      }
    }

    if (name === "spare_description") {
      if (newValue.length > 0 && spareList.length > 0) {
        const filtered = spareList.filter((item) =>
          item.spare_description
            .toLowerCase()
            .startsWith(newValue.toLowerCase()),
        );
        setSpareDescriptionSuggestions(filtered);
        setShowSpareDescriptionSuggestions(filtered.length > 0);
      } else {
        setShowSpareDescriptionSuggestions(false);
      }
    }
  };

  const handleSearch = async (type) => {
    setError("");
    try {
      let data;
      if (type === "spare_code") {
        data = await searchCGCELByCode(form.spare_code);
      } else if (type === "spare_description") {
        data = await searchCGCELByDescription(form.spare_description);
      } else {
        return;
      }
      setForm((prev) => ({
        ...prev,
        division: prev.division || "", // keep division
        spare_code: data.spare_code ?? "",
        spare_description: data.spare_description ?? "",
        cnf_qty: data.cnf_qty ?? "",
        grc_qty: data.grc_qty ?? "",
        own_qty: data.own_qty ?? 0,
      }));
    } catch (err) {
      setError({
        message: err?.message || "Not found",
        resolution: err?.resolution,
        type: "error",
      });
    }
  };

  const [errs, errs_label] = validateUpdate(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowToast(false);
    if (errs.length > 0) {
      setError({
        message: errs[0],
        type: "warning",
      });
      setShowToast(true);
      return;
    }
    setSubmitting(true);
    try {
      // Prepare payload as per schema
      let payload = {
        spare_code: form.spare_code,
        division: form.division,
        spare_description: form.spare_description,
        movement_type: form.movement_type,
        own_qty: form.qty,
        remark: form.remark,
      };
      payload = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await updateCGCELStock(payload);
      setError({
        message: "Stock updated successfully!",
        resolution: "Spare Code : " + form.spare_code,
        type: "success",
      });
      setShowToast(true);
      setForm(initialForm);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update stock.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] mt-4 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-170 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Update CGCEL Stock
        </h2>
        {/* City and PIN on same line, equal label/input width */}
        <div className="flex items-center w-full gap-7">
          <div className="flex items-center w-2/5 gap-2">
            <label
              htmlFor="division"
              className="w-45 text-md font-medium text-gray-700"
            >
              Division<span className="text-red-500">*</span>
            </label>
            <select
              id="division"
              name="division"
              required
              value={form.division}
              onChange={handleChange}
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.division ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              disabled={submitting}
            >
              <option value="" disabled></option>
              {divisionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <label
              htmlFor="spare_code"
              className="text-md font-medium text-gray-700 w-25"
            >
              Spare Code<span className="text-red-500">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="spare_code"
                name="spare_code"
                type="text"
                value={form.spare_code}
                onChange={handleChange}
                disabled={submitting}
                required
                autoComplete="off"
                className={`w-full px-3 py-1 ${errs_label.spare_code ? "border-red-300" : "border-gray-300"} rounded-lg border bg-gray-50 text-gray-900 font-medium`}
                maxLength={30}
                onFocus={() => {
                  if (
                    form.spare_code.length > 0 &&
                    spareCodeSuggestions.length > 0
                  )
                    setShowSpareCodeSuggestions(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowSpareCodeSuggestions(false), 150)
                }
              />
              {showSpareCodeSuggestions && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 10,
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    width: "100%",
                    maxHeight: 180,
                    overflowY: "auto",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {spareCodeSuggestions.map((item) => (
                    <li
                      key={item.spare_code}
                      style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                      onMouseDown={() => {
                        setForm((prev) => ({
                          ...prev,
                          spare_code: item.spare_code,
                        }));
                        setShowSpareCodeSuggestions(false);
                      }}
                    >
                      {item.spare_code}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              title="Search by code"
              className={`p-0 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center`}
              disabled={submitting || !form.spare_code}
              onClick={() => handleSearch("spare_code")}
              tabIndex={0}
              style={{ width: 32, height: 32 }}
            >
              <FiSearch size={20} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div
            className="flex items-center gap-3"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="spare_description"
              className="w-22.5 text-md font-medium text-gray-700"
            >
              Description<span className="text-red-500">*</span>
            </label>
            <div
              className="flex items-center w-full"
              style={{ position: "relative" }}
            >
              <div className="flex-1" style={{ position: "relative" }}>
                <input
                  id="spare_description"
                  name="spare_description"
                  type="text"
                  value={form.spare_description}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.spare_description ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  maxLength={40}
                  required
                  disabled={submitting}
                  autoComplete="Spare Description"
                  onFocus={() => {
                    if (
                      form.spare_description.length > 0 &&
                      spareDescriptionSuggestions.length > 0
                    )
                      setShowSpareDescriptionSuggestions(true);
                  }}
                  onBlur={() =>
                    setTimeout(
                      () => setShowSpareDescriptionSuggestions(false),
                      150,
                    )
                  }
                />
                {showSpareDescriptionSuggestions && (
                  <ul
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 10,
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      width: "100%",
                      maxHeight: 180,
                      overflowY: "auto",
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {spareDescriptionSuggestions.map((item) => (
                      <li
                        key={item.spare_code}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                        onMouseDown={() => {
                          setForm((prev) => ({
                            ...prev,
                            spare_description: item.spare_description,
                          }));
                          setShowSpareDescriptionSuggestions(false);
                        }}
                      >
                        {item.spare_description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                title="Search by Spare Description"
                className="ml-3 p-0 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
                disabled={submitting || !form.spare_description}
                onClick={() => handleSearch("spare_description")}
                tabIndex={0}
                style={{ width: 32, height: 32 }}
              >
                <FiSearch size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center w-full gap-5">
            <div className="flex items-center gap-2">
              <label
                htmlFor="cnf_qty"
                className="w-23.5 text-md font-medium text-gray-700"
              >
                CNF Qty
              </label>
              <input
                id="cnf_qty"
                name="cnf_qty"
                type="number"
                readOnly
                value={form.cnf_qty}
                onChange={handleChange}
                className="flex-1 w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed"
                disabled={submitting}
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="grc_qty"
                className="w-23.5 text-md font-medium text-gray-700"
              >
                GRC Qty
              </label>
              <input
                id="grc_qty"
                name="grc_qty"
                type="number"
                value={form.grc_qty}
                onChange={handleChange}
                className="flex-1 w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed"
                readOnly
                disabled={submitting}
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="own_qty"
                className="w-23.5 text-md font-medium text-gray-700"
              >
                Own Qty
              </label>
              <input
                id="own_qty"
                name="own_qty"
                type="number"
                value={form.own_qty}
                onChange={handleChange}
                className="flex-1 w-full px-3 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed"
                readOnly
                disabled={submitting}
              />
            </div>
          </div>
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              SPARE DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          {/* Contact 1 and Contact 2/Button on same line, equal label/input width */}
          <div className="flex items-center w-full gap-3">
            <div className="flex items-center w-2/5 gap-2">
              <label
                htmlFor="qty"
                className="w-23.5 text-md font-medium text-gray-700"
              >
                Quantity<span className="text-red-500">*</span>
              </label>
              <input
                id="qty"
                name="qty"
                type="number"
                value={form.qty}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.qty ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                required
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-3/5 gap-2">
              <label
                htmlFor="movement_type"
                className="w-29 text-md font-medium text-gray-700 ml-2"
              >
                Movement<span className="text-red-500">*</span>
              </label>
              <select
                id="movement_type"
                name="movement_type"
                value={form.movement_type}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.movement_type ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                required
                disabled={submitting}
              >
                <option value="" disabled></option>
                <option value="SPARE IN">SPARE IN</option>
                <option value="SPARE OUT">SPARE OUT</option>
              </select>
            </div>
          </div>

          {/* Remark (label beside input) */}
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="remark"
              className="w-22.5 text-md font-medium text-gray-700"
            >
              Remark<span className="text-red-500">*</span>
            </label>
            <textarea
              id="remark"
              name="remark"
              value={form.remark}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.remark ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              rows={2}
              autoComplete="off"
              disabled={submitting}
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-900 transition-colors duration-200 w-fit disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </form>
      {showToast && (
        <Toast
          message={error.message}
          resolution={error.resolution}
          type={error.type}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default StockCGCELUpdatePage;
