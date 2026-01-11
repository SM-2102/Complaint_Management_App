import React, { useState, useEffect, useRef } from "react";
// Ref and state for name input width

import Toast from "../components/Toast";
import { updateCustomer } from "../services/customerUpdateService";
import { searchCustomerByCode } from "../services/customerSearchByCodeService";
import { fetchCustomerNames } from "../services/customerNamesService";
import { FiSearch } from "react-icons/fi";
import { validateCustomer } from "../utils/customerValidation";
import { searchCustomerByName } from "../services/customerSearchByNameService";

const initialForm = {
  code: "",
  type: "CUSTOMER",
  name: "",
  contact_person: "",
  address1: "",
  address2: "",
  city: "",
  pin: "",
  consignee_address1: "",
  consignee_address2: "",
  consignee_city: "",
  consignee_pin: "",
  contact1: "",
  contact2: "",
  gst: "",
  discount_fan: "",
  discount_cgfan: "",
  discount_sda: "",
  discount_cgsda: "",
  discount_cglt: "",
  discount_cgfhp: "",
  discount_pump: "",
  discount_cgpump: "",
  discount_light: "",
  discount_whc: "",
  discount_cgwhc: "",  
};

const CustomerUpdatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [customerNames, setCustomerNames] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showContact2, setShowContact2] = useState(false);
  const nameInputRef = useRef(null);
  const [nameInputWidth, setNameInputWidth] = useState("100%");
  useEffect(() => {
    if (nameInputRef.current) {
      setNameInputWidth(nameInputRef.current.offsetWidth + "px");
    }
  }, [form.name, showSuggestions]);

  useEffect(() => {
    let mounted = true;
    fetchCustomerNames()
      .then((data) => {
        if (mounted && Array.isArray(data)) setCustomerNames(data);
      })
      .catch(() => {
        setCustomerNames([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // Enforce max character limits per field
    if (name == "name") {
      if (value.length > 40) return;
      // Capitalize first letter of each word
      newValue = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      // Autocomplete: filter suggestions as user types
      if (newValue.length > 0) {
        const filtered = customerNames.filter((n) =>
          n.toLowerCase().startsWith(newValue.toLowerCase()),
        );
        setNameSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
    setError((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAddContact2 = (e) => {
    e.preventDefault();
    setShowContact2(true);
  };

  const handleSearch = async (type) => {
    setError("");
    setShowToast(false);
    try {
      let data;
      if (type === "code") {
        data = await searchCustomerByCode(form.code);
      } else {
        data = await searchCustomerByName(form.name);
      }
      setForm((prev) => ({
        code: data.code ?? "",
        type: data.type ?? "CUSTOMER",
        name: data.name ?? "",
        contact_person: data.contact_person ?? "",
        address1: data.address1 ?? "",
        address2: data.address2 ?? "",
        city: data.city ?? "",
        pin: data.pin ?? "",
        contact1: data.contact1 ?? "",
        contact2: data.contact2 ?? "",
        gst: data.gst ?? "",
        consignee_address1: data.consignee_address1 ?? "",
        consignee_address2: data.consignee_address2 ?? "",
        consignee_city: data.consignee_city ?? "",
        consignee_pin: data.consignee_pin ?? "",
        discount_fan: data.discount_fan ?? "",
        discount_cgfan: data.discount_cgfan ?? "",
        discount_sda: data.discount_sda ?? "",
        discount_cgsda: data.discount_cgsda ?? "",
        discount_cglt: data.discount_cglt ?? "",
        discount_cgfhp: data.discount_cgfhp ?? "",
        discount_pump: data.discount_pump ?? "",
        discount_cgpump: data.discount_cgpump ?? "",
        discount_light: data.discount_light ?? "",
        discount_whc: data.discount_whc ?? "",
        discount_cgwhc: data.discount_cgwhc ?? "", 
      }));
      setShowContact2(!!data.contact2);
    } catch (err) {
      setError({
        message: err?.message || "Not found",
        resolution: err?.resolution,
        type: "error",
      });
      setShowToast(true);
    }
  };

  const [errs, errs_label] = validateCustomer(form, showContact2);

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
      const { code, ...rest } = form;
      const payload = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await updateCustomer(form.code, payload);
      setError({
        message: "Customer record updated successfully!",
        resolution: "Customer Name : " + form.name,
        type: "success",
      });
      setShowToast(true);
      setForm(initialForm);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update customer.",
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
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-150 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Update Customer Record
        </h2>
        <div className="flex flex-col gap-4">
        <div className="flex items-center w-full gap-3">
          {/* Code (readonly, small, label beside input) */}
          <div className="flex items-center gap-3 justify-center">
            <label htmlFor="code" className="text-md font-medium text-gray-700">
              Customer Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={form.code}
              onChange={handleChange}
              disabled={submitting}
              required
              autoComplete="off"
              className="w-28 text-center px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-medium"
              maxLength={5}
              style={{ minWidth: 0 }}
            />
            <button
              type="button"
              title="Search by code"
              className="p-0 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
              disabled={submitting || !form.code}
              onClick={() => handleSearch("code")}
              tabIndex={0}
              style={{ width: 32, height: 32 }}
            >
              <FiSearch size={20} />
            </button>
          </div>
          <div className="flex items-center flex-1 gap-2 min-w-0">
              <label
                htmlFor="type"
                className="w-18 text-md font-medium text-gray-700 ml-6"
              >
                Type<span className="text-red-500">*</span>
              </label>
              <div className="flex-1 min-w-0">
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.type ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  disabled={submitting}
                >
                  <option value="" disabled>
                    Select Type
                  </option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="DEALER">Dealer</option>
                </select>
              </div>
            </div>
          </div>
          {/* Name (label beside input) */}
          <div
            className="flex items-center gap-2 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="name"
              className="w-28 text-md font-medium text-gray-700"
            >
              Name<span className="text-red-500">*</span>
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.name ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                  minLength={3}
                  maxLength={40}
                  required
                  disabled={submitting}
                  autoComplete="name"
                  onFocus={() => {
                    if (form.name.length > 0 && nameSuggestions.length > 0)
                      setShowSuggestions(true);
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  ref={nameInputRef}
                />
                {showSuggestions && (
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
                      width: nameInputWidth,
                      maxHeight: 180,
                      overflowY: "auto",
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                    }}
                  >
                    {nameSuggestions.map((n) => (
                      <li
                        key={n}
                        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                        onMouseDown={() => {
                          setForm((prev) => ({ ...prev, name: n }));
                          setShowSuggestions(false);
                        }}
                      >
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                title="Search by name"
                className="p-1 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
                disabled={submitting || !form.name}
                onClick={() => handleSearch("name")}
                tabIndex={0}
                style={{ width: 32, height: 32 }}
              >
                <FiSearch size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="address1"
              className="w-28 text-md font-medium text-gray-700"
            >
              Address 1<span className="text-red-500">*</span>
            </label>
            <input
              id="address1"
              name="address1"
              value={form.address1}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.address1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              required
              autoComplete="street-address"
              disabled={submitting}
            />
          </div>
           <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="address2"
              className="w-28 text-md font-medium text-gray-700"
            >
              Address 2
            </label>
            <input
              id="address2"
              name="address2"
              value={form.address2}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.address2 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              autoComplete="street-address"
              disabled={submitting}
            />
          </div>
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="city"
                className="w-29 text-md font-medium text-gray-700"
              >
                City<span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.city ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={30}
                required
                autoComplete="address-level2"
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="pin"
                className="w-26 text-md font-medium text-gray-700"
              >
                Pincode<span className="text-red-500">*</span>
              </label>
              <input
                id="pin"
                name="pin"
                type="text"
                value={form.pin}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.pin ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={6}
                pattern="\d{6}"
                autoComplete="postal-code"
                disabled={submitting}
              />
            </div>
          </div>
                <div className="flex items-center w-full gap-7">
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="contact1"
                className="w-29 text-md font-medium text-gray-700"
              >
                Contact 1<span className="text-red-500">*</span>
              </label>
              <input
                id="contact1"
                name="contact1"
                type="text"
                value={form.contact1}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.contact1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={10}
                pattern="\d{10}"
                required
                autoComplete="tel"
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              {showContact2 ? (
                <>
                  <label
                    htmlFor="contact2"
                    className="w-26 text-md font-medium text-gray-700"
                  >
                    Contact 2
                  </label>
                  <input
                    id="contact2"
                    name="contact2"
                    type="text"
                    value={form.contact2}
                    onChange={handleChange}
                    className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.contact2 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                    maxLength={10}
                    pattern="\d{10}"
                    autoComplete="tel"
                    disabled={submitting}
                  />
                </>
              ) : (
                <button
                  className="text-blue-600 font-semibold hover:underline focus:outline-none text-left"
                  onClick={handleAddContact2}
                  type="button"
                  tabIndex={0}
                  disabled={submitting}
                >
                  + Add Another Contact
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="contact_person"
              className="w-28 text-md font-medium text-gray-700"
            >
              Contact Person
            </label>
            <input
              id="contact_person"
              name="contact_person"
              value={form.contact_person}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.contact_person ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={30}
              required
              autoComplete="Contact Person"
              disabled={submitting}
            />
          </div>
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="gst"
              className="w-28 text-md font-medium text-gray-700"
            >
              GST
            </label>
            <input
              id="gst"
              name="gst"
              type="text"
              value={form.gst}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.gst ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={15}
              pattern="[A-Z0-9]{15}"
              autoComplete="off"
              disabled={submitting}
            />
          </div>
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              CONSIGNEE DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          <div className="flex items-center gap-3">
              <label className="text-md font-semibold text-gray-700 mr-10">Consignee Address</label>
              <button
                type="button"
                className="text-sm px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    consignee_address1: prev.address1,
                    consignee_address2: prev.address2,
                    consignee_city: prev.city,
                    consignee_pin: prev.pin,
                  }));
                }}
              >
                Same as Billing Address
              </button>
            </div>
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="consignee_address1"
              className="w-28 text-md font-medium text-gray-700"
            >
              Address 1<span className="text-red-500">*</span>
            </label>
            <input
              id="consignee_address1"
              name="consignee_address1"
              value={form.consignee_address1}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.consignee_address1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              required
              autoComplete="street-address"
              disabled={submitting}
            />
          </div>
           <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="consignee_address2"
              className="w-28 text-md font-medium text-gray-700"
            >
              Address 2
            </label>
            <input
              id="consignee_address2"
              name="consignee_address2"
              value={form.consignee_address2}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.consignee_address2 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              autoComplete="street-address"
              disabled={submitting}
            />
          </div>
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="consignee_city"
                className="w-29 text-md font-medium text-gray-700"
              >
                City<span className="text-red-500">*</span>
              </label>
              <input
                id="consignee_city"
                name="consignee_city"
                type="text"
                value={form.consignee_city}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.consignee_city ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={30}
                required
                autoComplete="address-level2"
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="consignee_pin"
                className="w-26 text-md font-medium text-gray-700"
              >
                Pincode<span className="text-red-500">*</span>
              </label>
              <input
                id="consignee_pin"
                name="consignee_pin"
                type="text"
                value={form.consignee_pin}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.consignee_pin ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={6}
                pattern="\d{6}"
                autoComplete="postal-code"
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
              STANDARD DISCOUNT DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full rounded-lg border-collapse table-auto text-md">
              <thead>
                <tr className="text-blue-900">
                  <th className="px-4 py-2 text-center">&nbsp;</th>
                  <th className="px-4 py-2 text-center">CGCEL</th>
                  <th className="px-4 py-2 text-center">CGPISL</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["FAN", "discount_fan", "discount_cgfan"],
                  ["PUMP", "discount_pump", "discount_cgpump"],
                  ["FHP", "discount_fhp", "discount_cgfhp"],
                  ["LT", "discount_lt", "discount_cglt"],
                  ["LIGHT", "discount_light", "discount_cglight"],
                  ["SDA", "discount_sda", "discount_cgsda"],
                  ["WHC", "discount_whc", "discount_cgwhc"],
                ].map(([label, cgcelKey, cgpislKey]) => (
                  <tr key={label} className="">
                    <td className="px-4 py-2 font-medium text-gray-700">{label}</td>
                    <td className="px-4 py-2 text-center">
                      {['discount_fhp', 'discount_lt'].includes(cgcelKey) ? (
                        <div className="w-24 h-8 mx-auto"></div>
                      ) : (
                        <input
                          type="number"
                          inputMode="decimal"
                          name={cgcelKey}
                          value={form[cgcelKey]}
                          onChange={handleChange}
                          min={0}
                          step={1}
                          className="w-24 mx-auto block px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 text-center"
                          disabled={submitting}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {['discount_cglight'].includes(cgpislKey) ? (
                        <div className="w-24 h-8 mx-auto"></div>
                      ) : (
                      <input
                        type="number"
                        inputMode="decimal"
                        name={cgpislKey}
                        value={form[cgpislKey]}
                        onChange={handleChange}
                        min={0}
                        step={1}
                        className="w-24 mx-auto block px-2 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 text-center"
                        disabled={submitting}
                      />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>         
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-900 transition-colors duration-200 w-fit disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Record"}
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

export default CustomerUpdatePage;
