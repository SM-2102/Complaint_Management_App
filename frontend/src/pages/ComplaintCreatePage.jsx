import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { FiSearch } from "react-icons/fi";
import { validateCreateComplaint } from "../utils/complaintCreateValidation";
import { createComplaint } from "../services/complaintCreateService";
import { searchCustomerByNameForComplaint } from "../services/customerSearchByNameForComplaintService";
import { fetchComplaintCreateData } from "../services/complaintCreateDataService";

function todayLocalDMY() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
}


const initialForm = {
  complaint_type: "",
  complaint_number: "",
  complaint_head: "CGCEL",
  customer_type: "",
  product_division: "",
  customer_name: "",
  customer_address1: "",
  customer_address2: "",
  customer_city: "",
  customer_pincode: "",
  customer_contact1: "",
  customer_contact2: "",
  product_model: "",
  product_serial_number: "",
  updated_time: "",
  appoint_date: "",
  current_status: "",
  action_by: "",
  technician: "",
  action_head: "",  
  complaint_priority: "",
};

const ComplaintCreatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [initialComplaintNumber, setInitialComplaintNumber] = useState("");
  const [codeLoading, setCodeLoading] = useState(true);
  const [customerNames, setCustomerNames] = useState([]);
  const [optionData, setOptionData] = useState({});
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState({});
  const nameInputRef = useRef(null);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showContact2, setShowContact2] = useState(false);
  const [entryType, setEntryType] = useState("");
  const [nameInputWidth, setNameInputWidth] = useState("100%");
    useEffect(() => {
      if (nameInputRef.current) {
        setNameInputWidth(nameInputRef.current.offsetWidth + "px");
      }
    }, [form.customer_name, showSuggestions]);

    // Fetch initial data for complaint create (complaint number, names, dropdowns)
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const data = await fetchComplaintCreateData();
          if (!mounted) return;
          // DEBUG: inspect fetched data shape
          // Store fetched complaint number separately; don't show unless Entry Type is NEW
          setInitialComplaintNumber(data.complaint_number || "");
          // store arrays for selects
          setOptionData({
            action_head: data.action_head || [],
            action_by: data.action_by || [],
            technician: data.technician || [],
          });
          // customer names for suggestions
          setCustomerNames(data.customer_name || []);
        } catch (err) {
          // ignore silently for now; UI will show when search fails
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, []);

  const handleSearch = async () => {
    setError("");
    setShowToast(false);
    try {
      const data = await searchCustomerByNameForComplaint(form.customer_name);
      setForm((prev) => ({
        ...prev,
        customer_address1: data.address1 ?? "",
        customer_address2: data.address2 ?? "",
        customer_city: data.city ?? "",
        customer_pincode: data.pin ?? "",
        customer_contact1: data.contact1 ?? "",
        customer_contact2: data.contact2 ?? "",
      }));
      setShowContact2(!!(data.contact2));
    } catch (err) {
      setError({
        message: err?.message || "Not found",
        resolution: err?.resolution,
        type: "error",
      });
      setShowToast(true);
    }
  };

  const divisionOptions = {
    CGCEL: ["FANS", "SDA", "PUMP", "WHC", "LIGHT"],
    CGPISL: ["CG-FANS", "CG-SDA", "CG-LT", "CG-FHP", "CG-PUMP", "CG-WHC"],
  };

  useEffect(() => {
    // Ensure product_division stays valid when complaint_head changes
    const head = form.complaint_head || "CGCEL";
    const opts = divisionOptions[head] || [];
    if (!opts.includes(form.product_division)) {
      // reset to empty so placeholder 'Select Division' shows
      setForm((prev) => ({ ...prev, product_division: "" }));
    }
  }, [form.complaint_head]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    // Enforce max character limits per field
    // the input field is named `customer_name` in the form
    if (name === "customer_name") {
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

  // Always compute validation errors for rendering
  const validationForm = { ...form, complaint_number: entryType === "NEW" ? initialComplaintNumber : form.complaint_number };
  const [errs, errs_label] = validateCreateComplaint(validationForm, showContact2, entryType);

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
      const complaintNumberToSend = entryType === "NEW" ? initialComplaintNumber : form.complaint_number;
      const payload = Object.fromEntries(
        Object.entries({ ...rest, complaint_number: complaintNumberToSend }).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await createComplaint(payload, entryType);
      setError({
        message: "Complaint record created successfully!",
        resolution: "Complaint Number : " + (complaintNumberToSend || ""),
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create complaint.",
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
        className="bg-[#f8fafc] shadow-lg rounded-lg p-6 w-full max-w-190 border border-gray-200"
        noValidate
      >
        <h2 className="text-xl font-semibold text-blue-800 mb-4 pb-2 border-b border-blue-500 justify-center flex items-center gap-2">
          Create Complaint Record
        </h2>
        <div className="flex flex-col gap-4">      
           <div className="flex items-center w-full gap-7">
            <div className="flex items-center w-1/2">
              <label htmlFor="entry_type" className="text-md font-medium text-gray-700 w-65">
                Entry Type<span className="text-red-500">*</span>
              </label>
              <select
                id="entry_type"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.entryType ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled>
                </option>
                <option value="NEW">NEW</option>
                <option value="CRM">CRM</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="complaint_number" className="w-60 text-md font-medium text-blue-700">
                Complaint No.<span className="text-red-500">*</span>
              </label>
              {entryType === "NEW" ? (
                <input
                  id="complaint_number"
                  name="complaint_number"
                  type="text"
                  value={initialComplaintNumber}
                  onChange={() => {}}
                  maxLength={15}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_number ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900`}
                  disabled={submitting}
                  readOnly
                  autoComplete="off"
                />
              ) : (
                <input
                  id="complaint_number"
                  name="complaint_number"
                  type="text"
                  value={form.complaint_number}
                  onChange={handleChange}
                  maxLength={15}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_number ? "border-red-300" : "border-gray-300"} text-gray-900`}
                  disabled={submitting}
                  autoComplete="off"
                />
              )}
            </div>
            </div>    
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center flex-1 gap-2 w-1/4">
              <label htmlFor="complaint_head" className="w-33.5 text-md font-medium text-gray-700">
                Complaint Head<span className="text-red-500">*</span>
              </label>
              <select
                id="complaint_head"
                name="complaint_head"
                value={form.complaint_head}
                onChange={handleChange}
                disabled={submitting}
                className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.complaint_head ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="CGCEL">CGCEL</option>
                <option value="CGPISL">CGPISL</option>
              </select>
            </div>
            <div className="flex items-center flex-1 gap-2">
              <label htmlFor="complaint_date" className="w-60 text-md font-medium text-gray-700">
                Complaint Date<span className="text-red-500">*</span>
              </label>
              <input
                id="complaint_date"
                name="complaint_date"
                type="text"
                value={todayLocalDMY()}
                disabled={submitting}
                readOnly
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900 cursor-not-allowed`}
              />
            </div>
          </div>

          <div className="flex items-center w-full gap-7">
            <div className="flex items-center flex-1 gap-2 w-1/2">
              <label htmlFor="complaint_type" className="w-33.5 text-md font-medium text-gray-700">
                Complaint Type<span className="text-red-500">*</span>
              </label>
              <select
                id="complaint_type"
                name="complaint_type"
                value={form.complaint_type}
                onChange={handleChange}
                disabled={submitting}
                className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.complaint_type ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled>
                </option>
                <option value="INSTALL">INSTALL</option>
                <option value="SERVICE">SERVICE</option>
                <option value="SALE">SALE</option>
              </select>
            </div>
            
             <div className="flex items-center flex-1 gap-2">
              <label htmlFor="customer_type" className="w-33 text-md font-medium text-gray-700">
                Customer Type<span className="text-red-500">*</span>
              </label>
              <select
                id="customer_type"
                name="customer_type"
                value={form.customer_type}
                onChange={handleChange}
                disabled={submitting}
                className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.customer_type ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled>
                </option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="DEALER">DEALER</option>
              </select>
            </div>
          </div>
           <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              CUSTOMER DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
           <div
                       className="flex items-center gap-2 w-full"
                       style={{ position: "relative" }}
                     >
                       <label
                         htmlFor="customer_name"
                         className="w-29 text-md font-medium text-gray-700"
                       >
                         Name<span className="text-red-500">*</span>
                       </label>
                       <div className="flex-1 flex items-center gap-2">
                         <div style={{ position: "relative", width: "100%" }}>
                           <input
                             id="customer_name"
                             name="customer_name"
                             type="text"
                             value={form.customer_name}
                             onChange={handleChange}
                             className={`w-full px-3 py-1 rounded-lg border ${errs_label.customer_name ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                             minLength={3}
                             maxLength={40}
                             required
                             disabled={submitting}
                             autoComplete="name"
                             onFocus={() => {
                               if (form.customer_name.length > 0 && nameSuggestions.length > 0)
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
                                     setForm((prev) => ({ ...prev, customer_name: n }));
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
                           disabled={submitting || !form.customer_name}
                           onClick={() => handleSearch("customer_name")}
                           tabIndex={0}
                           style={{ width: 32, height: 32 }}
                         >
                           <FiSearch size={20} />
                         </button>
                       </div>
                     </div>
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="customer_address1"
              className="w-28 text-md font-medium text-gray-700"
            >
              Address 1<span className="text-red-500">*</span>
            </label>
            <input
              id="customer_address1"
              name="customer_address1"
              value={form.customer_address1}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.customer_address1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              required
              autoComplete="street-address"
              disabled={submitting}
            />
          </div>
           <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="customer_address2"
              className="w-28 text-md font-medium text-gray-700"
            >
              Address 2
            </label>
            <input
              id="customer_address2"
              name="customer_address2"
              value={form.customer_address2}
              onChange={handleChange}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.customer_address2 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
              autoComplete="street-address"
              disabled={submitting}
            />
          </div>
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="customer_city"
                className="w-29 text-md font-medium text-gray-700"
              >
                City<span className="text-red-500">*</span>
              </label>
              <input
                id="customer_city"
                name="customer_city"
                type="text"
                value={form.customer_city}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.customer_city ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
                maxLength={30}
                required
                autoComplete="address-level2"
                disabled={submitting}
              />
            </div>
            <div className="flex items-center w-1/2 gap-2">
              <label
                htmlFor="customer_pincode"
                className="w-26 text-md font-medium text-gray-700"
              >
                Pincode<span className="text-red-500">*</span>
              </label>
              <input
                id="customer_pincode"
                name="customer_pincode"
                type="text"
                value={form.customer_pincode}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.customer_pincode ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
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
                htmlFor="customer_contact1"
                className="w-29 text-md font-medium text-gray-700"
              >
                Contact 1<span className="text-red-500">*</span>
              </label>
              <input
                id="customer_contact1"
                name="customer_contact1"
                type="text"
                value={form.customer_contact1}
                onChange={handleChange}
                className={`flex-1 w-full px-3 py-1 rounded-lg border ${errs_label.customer_contact1 ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
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
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              PRODUCT DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-2/5">
              <label htmlFor="product_division" className="w-45 text-md font-medium text-gray-700">
                Division<span className="text-red-500">*</span>
              </label>
              <select
                id="product_division"
                name="product_division"
                value={form.product_division}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.product_division ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled>
                </option>
                {(divisionOptions[form.complaint_head] || []).map((d) => (
                  <option key={d} value={d} title={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 w-3/5">
              <label htmlFor="product_model" className="w-50 text-md font-medium text-gray-700 ml-7">
                Product Model
              </label>
              <input
                id="product_model"
                name="product_model"
                type="text"
                maxLength={25}
                value={form.product_model}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
              />
            </div>
          </div>

          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-2/5">
              <label htmlFor="updated_time" className="w-45 text-md font-medium text-gray-700">
                Upload Time
              </label>
              <input
                id="updated_time"
                name="updated_time"
                type="text"
                maxLength={7}
                value={form.updated_time}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.updated_time ? "border-red-300" : "border-gray-300"} text-gray-900`}
                placeholder="DD-HHMM"
              />
            </div>
            <div className="flex items-center gap-2 w-3/5">
              <label htmlFor="product_serial_number" className="w-50 text-md font-medium text-gray-700 ml-7">
                Serial Number
              </label>
              <input
                id="product_serial_number"
                name="product_serial_number"
                type="text"
                maxLength={20}
                value={form.product_serial_number}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
              />
            </div>
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-2/5">
              <label htmlFor="appoint_date" className="w-45 text-md font-medium text-gray-700">
                Appoint Date
              </label>
              <input
                id="appoint_date"
                name="appoint_date"
                type="date"
                min={new Date().toLocaleDateString("en-CA")}
                value={form.appoint_date}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-3/5">
              <label htmlFor="current_status" className="w-50 text-md font-medium text-gray-700 ml-7">
                Current Status<span className="text-red-500">*</span>
              </label>
              <input
                id="current_status"
                name="current_status"
                type="text"
                required
                maxLength={50}
                value={form.current_status}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.current_status ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              COMPLAINT STATUS DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center flex-1 gap-2 w-2/5">
              <label htmlFor="action_by" className="w-35 text-md font-medium text-gray-700">
                Action By<span className="text-red-500">*</span>
              </label>
              <select
                id="action_by"
                name="action_by"
                value={form.action_by}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.action_by ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled></option>
                {(optionData.action_by || []).map((a) => (
                  <option key={a} value={a} title={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center flex-1 gap-2 w-3/5">
              <label htmlFor="action_head" className="w-33 text-md font-medium text-gray-700 ml-7">
                Action Required<span className="text-red-500">*</span>
              </label>
              <select
                id="action_head"
                name="action_head"
                value={form.action_head}
                onChange={handleChange}
                disabled={submitting}
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.action_head ? "border-red-300" : "border-gray-300"} text-gray-900 truncate`}
              >
                <option value="" disabled></option>
                {(optionData.action_head || []).map((h) => (
                  <option key={h} value={h} title={h} className="truncate">
                    {h.length > 60 ? h.slice(0, 57) + "..." : h}
                  </option>
                ))}
              </select>
            </div>
            
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-2/5">
              <label htmlFor="technician" className="w-35 text-md font-medium text-gray-700">
                Technician<span className="text-red-500">*</span>
              </label>
              <select
                id="technician"
                name="technician"
                value={form.technician}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.technician ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled></option>
                {(optionData.technician || []).map((t) => (
                  <option key={t} value={t} title={t} className="truncate">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 w-3/5">
              <label htmlFor="complaint_priority" className="w-57 text-md font-medium text-gray-700 ml-7">
                Action Priority<span className="text-red-500">*</span>
              </label>
              <select
                id="complaint_priority"
                name="complaint_priority"
                value={form.complaint_priority}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_priority ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled></option>
                <option value="NORMAL">NORMAL</option>
                <option value="URGENT">URGENT</option>
                <option value="HO-ESCALATION">HO-ESCALATION</option>
                <option value="CRM-ESCALATION">CRM-ESCALATION</option>
                <option value="MD-ESCALATION">MD-ESCALATION</option>
              </select>
            </div>
          </div>
        
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-900 transition-colors duration-200 w-fit disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Record"}
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

export default ComplaintCreatePage;
