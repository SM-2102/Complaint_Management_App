import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Toast from "../components/Toast";
import YesNoToggle from "../components/YesNoToggle";
import FinalStatusToggle from "../components/FinalStatus";
import { FiSearch } from "react-icons/fi";
import { validateUpdateComplaint } from "../utils/complaintUpdateValidation";
import { searchCustomerByNameForComplaint } from "../services/customerSearchByNameForComplaintService";
import { fetchComplaintUpdateData } from "../services/complaintUpdateDataService";
import { searchComplaintByNumber } from "../services/complaintSearchByNumberService";
import { updateComplaint } from "../services/complaintUpdateService";

const initialForm = {
  complaint_number: "",
  complaint_date: "",
  product_division: "",
  complaint_head: "",
  complaint_status: "",
  product_model: "",
  product_serial_number: "",
  invoice_date: "",
  invoice_number: "",
  purchased_from: "",
  distributor_name: "",
  complaint_type: "",
  customer_type: "",
  customer_name: "",
  customer_address1: "",
  customer_address2: "",
  customer_city: "",
  customer_pincode: "",
  customer_contact1: "",
  customer_contact2: "",
  updated_time: "",
  appoint_date: "",
  current_status: "",
  action_by: "",
  technician: "",
  action_head: "",  
  complaint_priority: "",
  spare_pending: "N",
  spare: "",
  indent_date: "",
  indent_so_number: "",
  indent_so_date: "",
  payment_collected: "N",
  payment_mode: "",
  amount_sc: "",
  amount_spare: "",
  payment_details: "",
  final_status: "N",
};

const ComplaintUpdatePage = () => {
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [initialComplaintNumber, setInitialComplaintNumber] = useState("");
  const [complaintNumbers, setComplaintNumbers] = useState([]);
  const [codeLoading, setCodeLoading] = useState(true);
  const [complaintNumberSuggestions, setComplaintNumberSuggestions] = useState([]);
  const [showComplaintSuggestions, setShowComplaintSuggestions] = useState(false);
  const complaintNumberInputRef = useRef(null);
  const [complaintNumberInputWidth, setComplaintNumberInputWidth] = useState("100%");
  const [customerNames, setCustomerNames] = useState([]);
  const [optionData, setOptionData] = useState({});
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState({});
  const nameInputRef = useRef(null);
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showContact2, setShowContact2] = useState(false);
  const [showRevisitModal, setShowRevisitModal] = useState(false);
  // entryType removed: always allow manual complaint_number input
  const [nameInputWidth, setNameInputWidth] = useState("100%");
    useEffect(() => {
      if (nameInputRef.current) {
        setNameInputWidth(nameInputRef.current.offsetWidth + "px");
      }
    }, [form.customer_name, showSuggestions]);

    useEffect(() => {
      if (complaintNumberInputRef.current) {
        setComplaintNumberInputWidth(complaintNumberInputRef.current.offsetWidth + "px");
      }
    }, [form.complaint_number, showComplaintSuggestions]);

    // format ISO date (yyyy-mm-dd) to display (dd-mm-yyyy)
    const formatISOToDisplay = (iso) => {
      if (!iso) return "";
      // accept iso like 2025-10-07
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) return `${m[3]}-${m[2]}-${m[1]}`;
      // if already in dd-mm-yyyy, return as-is
      const m2 = iso.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (m2) return iso;
      return iso;
    };

    // Fetch initial data for complaint create (complaint number, names, dropdowns)
    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          const data = await fetchComplaintUpdateData();
          if (!mounted) return;
          // DEBUG: inspect fetched data shape
          // Store fetched complaint number separately; don't show unless Entry Type is NEW
          setInitialComplaintNumber(data.complaint_number || "");
          // complaint_number may be an array in response; store for suggestions
          setComplaintNumbers(Array.isArray(data.complaint_number) ? data.complaint_number : (data.complaint_number ? [data.complaint_number] : []));
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
        customer_name: prev.customer_name ?? "",
        customer_address1: data.address1 ?? "",
        customer_address2: data.address2 ?? "",
        customer_city: data.city ?? "",
        customer_pincode: data.pin ?? "",
        customer_contact1: data.contact1 ?? "",
        customer_contact2: data.contact2 ?? "",
      }));
      setShowContact2(!!(data.contact2 ?? data.customer_contact2));
    } catch (err) {
      setError({
        message: err?.message || "Not found",
        resolution: err?.resolution,
        type: "error",
      });
      setShowToast(true);
    }
  };

  const handleSearchByNumber = async () => {
    setError("");
    setShowToast(false);
    try {
      const data = await searchComplaintByNumber(form.complaint_number);
      setForm((prev) => ({
        ...prev,
        complaint_date: data.complaint_date ?? "",
        complaint_head: data.complaint_head ?? "",
        product_division: data.product_division ?? "",
        product_model: data.product_model ?? "",
        product_serial_number: data.product_serial_number ?? "",
        purchased_from: data.purchased_from ?? "",
        distributor_name: data.distributor_name ?? "",
        invoice_date: data.invoice_date ?? "",
        invoice_number: data.invoice_number ?? "",
        customer_name: data.customer_name ?? "",
        customer_address1: data.customer_address1 ?? "",
        customer_address2: data.customer_address2 ?? "",
        customer_city: data.customer_city ?? "",
        customer_pincode: data.customer_pincode ?? "",
        customer_contact1: data.customer_contact1 ?? "",
        customer_contact2: data.customer_contact2 ?? "",
        complaint_type: data.complaint_type ?? "",
        updated_time: data.updated_time ?? "",
        current_status: data.current_status ?? "",
        action_by: data.action_by ?? "",
        technician: data.technician ?? "",
        action_head: data.action_head ?? "",
        complaint_status: data.complaint_status ?? "",
            complaint_priority: data.complaint_priority ?? "",
            spare_pending: data.spare_pending ?? "N",
            spare: data.spare ?? "",
            indent_date: data.indent_date ?? "",
            indent_so_number: data.indent_so_number ?? "",
            indent_so_date: data.indent_so_date ?? "",
            payment_collected: data.payment_collected ?? "N",
            payment_mode: data.payment_mode ?? "",
            amount_sc: data.amount_sc ?? "",
            amount_spare: data.amount_spare ?? "",
            payment_details: data.payment_details ?? "",
            final_status: data.final_status ?? "N",
      }));
      setShowContact2(!!data.customer_contact2);
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
    CGCEL: ["CG-FANS", "CG-SDA", "CG-PUMP", "CG-WHC"],
    CGPISL: ["FANS", "SDA", "LT", "FHP", "PUMP", "LIGHT", "WHC"],
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

  // Editable only when complaint number starts with 'N' (new complaints)
  const isNewComplaint = (form.complaint_number || "").toString().trim().toUpperCase().startsWith("N");

  // If complaint_number is present in URL, trigger search on mount / when search changes
  useEffect(() => {
    // Prefer complaint_number passed via route state (navigate('/UpdateComplaint', { state }))
    const stateNumber = location?.state?.complaint_number;
    const params = new URLSearchParams(location.search || "");
    const queryNumber = params.get("complaint_number");
    const q = stateNumber || queryNumber;
    if (!q) return;
    let mounted = true;
    (async () => {
      setError("");
      setShowToast(false);
      try {
        const data = await searchComplaintByNumber(q);
        if (!mounted) return;
        setForm((prev) => ({
          ...prev,
          complaint_number: q,
          complaint_date: data.complaint_date ?? "",
        complaint_head: data.complaint_head ?? "",
        product_division: data.product_division ?? "",
        product_model: data.product_model ?? "",
        product_serial_number: data.product_serial_number ?? "",
        purchased_from: data.purchased_from ?? "",
        distributor_name: data.distributor_name ?? "",
        invoice_date: data.invoice_date ?? "",
        invoice_number: data.invoice_number ?? "",
        customer_name: data.customer_name ?? "",
        customer_address1: data.customer_address1 ?? "",
        customer_address2: data.customer_address2 ?? "",
        customer_city: data.customer_city ?? "",
        customer_pincode: data.customer_pincode ?? "",
        customer_contact1: data.customer_contact1 ?? "",
        customer_contact2: data.customer_contact2 ?? "",
        complaint_type: data.complaint_type ?? "",
        updated_time: data.updated_time ?? "",
        current_status: data.current_status ?? "",
        action_by: data.action_by ?? "",
        technician: data.technician ?? "",
        action_head: data.action_head ?? "",
        complaint_status: data.complaint_status ?? "",
            complaint_priority: data.complaint_priority ?? "",
            spare_pending: data.spare_pending ?? "N",
            spare: data.spare ?? "",
            indent_date: data.indent_date ?? "",
            indent_so_number: data.indent_so_number ?? "",
            indent_so_date: data.indent_so_date ?? "",
            payment_collected: data.payment_collected ?? "N",
            payment_mode: data.payment_mode ?? "",
            amount_sc: data.amount_sc ?? "",
            amount_spare: data.amount_spare ?? "",
            payment_details: data.payment_details ?? "",
            final_status: data.final_status ?? "N",
        }));
        setShowContact2(!!(data.customer_contact2));
      } catch (err) {
        if (!mounted) return;
        setError({
          message: err?.message || "Not found",
          resolution: err?.resolution,
          type: "error",
        });
        setShowToast(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [location.search]);


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
    // if typing in complaint_number, prepare suggestions
    if (name === "complaint_number") {
      if (newValue.length > 0) {
        const filtered = (complaintNumbers || []).filter((n) =>
          String(n).toLowerCase().includes(newValue.toLowerCase()),
        );
        // reuse nameSuggestions state to show complaint suggestions? create separate state
        setComplaintNumberSuggestions(filtered);
        setShowComplaintSuggestions(filtered.length > 0);
      } else {
        setShowComplaintSuggestions(false);
      }
    }
  };

  const handleAddContact2 = (e) => {
    e.preventDefault();
    setShowContact2(true);
  };

  // Always compute validation errors for rendering
  // pass a non-empty default for entryType to satisfy validator (entryType UI removed)
  const [errs, errs_label] = validateUpdateComplaint(form, showContact2);

  const submitUpdate = async (revisitValue = null) => {
    setSubmitting(true);
    setError("");
    setShowToast(false);
    try {
      let payload = {
        product_division: form.product_division,
        complaint_head: form.complaint_head,
        product_model: form.product_model,
        product_serial_number: form.product_serial_number,
        invoice_date: form.invoice_date,
        invoice_number: form.invoice_number,
        purchased_from: form.purchased_from,
        distributor_name: form.distributor_name,
        customer_name: form.customer_name,
        customer_address1: form.customer_address1,
        customer_address2: form.customer_address2,
        customer_city: form.customer_city,
        customer_pincode: form.customer_pincode,
        customer_contact1: form.customer_contact1,
        customer_contact2: form.customer_contact2,
        complaint_type: form.complaint_type,
        updated_time: form.updated_time,
        action_by: form.action_by,
        complaint_status: form.complaint_status,
        technician: form.technician,
        complaint_priority: form.complaint_priority,
        current_status: form.current_status,
        action_head: form.action_head,
        spare_pending: form.spare_pending,
        spare: form.spare,
        indent_date: form.indent_date,
        indent_so_number: form.indent_so_number,
        indent_so_date: form.indent_so_date,
        payment_collected: form.payment_collected,
        payment_mode: form.payment_mode,
        payment_details: form.payment_details,
        amount_sc: form.amount_sc === "" || form.amount_sc == null ? null : Number(form.amount_sc),
        amount_spare: form.amount_spare === "" || form.amount_spare == null ? null : Number(form.amount_spare),
        final_status: form.final_status,
        revisit: revisitValue,
      };
      payload = Object.fromEntries(
        Object.entries(payload).map(([k, v]) => [k, v === "" ? null : v]),
      );
      await updateComplaint(form.complaint_number, payload);
      setError({
        message: "Complaint updated successfully!",
        resolution: "Complaint Number : " + (form.complaint_number || ""),
        type: "success",
      });
      setShowToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError({
        message: err?.message || "Failed to update complaint.",
        resolution: err?.resolution || "",
        type: "error",
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
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
    // If final_status is 'Y' ask revisit choice before sending
    if (form.final_status === "Y") {
      setShowRevisitModal(true);
      return;
    }
    // otherwise submit without revisit
    submitUpdate(null);
  };

  const handleRevisitChoice = (choice) => {
    // choice: true => 'Y', false => 'N'
    setShowRevisitModal(false);
    const revisitValue = choice ? "Y" : "N";
    submitUpdate(revisitValue);
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
          Update Complaint Record
        </h2>
        <div className="flex flex-col gap-4">      
          {/* hidden checkbox inputs allow labels to reference a form control for accessibility */}
          <input
            id="spare_pending"
            type="checkbox"
            aria-hidden="true"
            onChange={() => {}}
            checked={form.spare_pending === "Y"}
            className="sr-only"
          />
          <input
            id="payment_collected"
            type="checkbox"
            aria-hidden="true"
            onChange={() => {}}
            checked={form.payment_collected === "Y"}
            className="sr-only"
          />
           <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2">
              <label htmlFor="complaint_number" className="w-50 text-md font-medium text-blue-700">
                Complaint No.<span className="text-red-500">*</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    id="complaint_number"
                    name="complaint_number"
                    type="text"
                    value={form.complaint_number}
                    onChange={handleChange}
                    disabled={submitting}
                    autoComplete="off"
                    className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_number ? "border-red-300" : "border-gray-300"} text-gray-900`}
                    maxLength={15}
                    ref={complaintNumberInputRef}
                    onFocus={() => {
                      if (form.complaint_number.length > 0 && complaintNumberSuggestions.length > 0)
                        setShowComplaintSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowComplaintSuggestions(false), 150)}
                  />
                  {showComplaintSuggestions && (
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
                        width: complaintNumberInputWidth,
                        maxHeight: 180,
                        overflowY: "auto",
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                      }}
                    >
                      {complaintNumberSuggestions.map((n) => (
                        <li
                          key={n}
                          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                          onMouseDown={() => {
                            setForm((prev) => ({ ...prev, complaint_number: n }));
                            setShowComplaintSuggestions(false);
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
                  title="Search by complaint number"
                  className="p-1 rounded-full bg-gradient-to-tr from-blue-200 to-blue-500 text-white shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-900 focus:outline-none transition-all duration-200 flex items-center justify-center"
                  disabled={submitting || !form.complaint_number}
                  onClick={handleSearchByNumber}
                  tabIndex={0}
                  style={{ width: 32, height: 32, flex: "0 0 32px" }}
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </div>
             <div className="flex items-center gap-2">
              <label htmlFor="complaint_date" className="w-60 text-md font-medium text-gray-700">
                Complaint Date<span className="text-red-500">*</span>
              </label>
              <input
                id="complaint_date"
                name="complaint_date"
                type="text"
                value={formatISOToDisplay(form.complaint_date)}
                readOnly
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900 cursor-not-allowed`}
              />
            </div>
           </div>
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="product_division" className="w-52.5 text-md font-medium text-gray-700">
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
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="complaint_head" className="w-59 text-md font-medium text-gray-700">
                Complaint Head<span className="text-red-500">*</span>
              </label>
              <select
                id="complaint_head"
                name="complaint_head"
                value={form.complaint_head}
                onChange={handleChange}
                disabled={submitting || !isNewComplaint}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_head ? "border-red-300" : "border-gray-300"} text-gray-900`}
                title={isNewComplaint ? "" : "Read-only for existing complaints"}
              >
                <option value="" disabled>
                </option>
                <option value="CGCEL">CGCEL</option>
                <option value="CGPISL">CGPISL</option>
              </select>
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
          
          <div className="flex items-center w-full gap-7">
            
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="product_model" className="w-50 text-md font-medium text-gray-700">
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
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="product_serial_number" className="w-58 text-md font-medium text-gray-700">
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

            <div className="flex items-center w-full gap-7">
              <div className="flex items-center gap-2 w-1/2">
                <label htmlFor="purchased_from" className="w-50 text-md font-medium text-gray-700">
                  Purchased From
                </label>
                <input
                  id="purchased_from"
                  name="purchased_from"
                  type="text"
                  maxLength={40}
                  value={form.purchased_from}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
                />
              </div>
              <div className="flex items-center gap-2 w-1/2">
                <label htmlFor="invoice_number" className="w-58 text-md font-medium text-gray-700">
                  Invoice Number
                </label>
                <input
                  id="invoice_number"
                  name="invoice_number"
                  type="text"
                  maxLength={25}
                  value={form.invoice_number}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
                />
              </div>
              
              
            </div>

            <div className="flex items-center w-full gap-7">
              
              <div className="flex items-center gap-2 w-1/2">
                <label htmlFor="distributor_name" className="w-50 text-md font-medium text-gray-700">
                  Distributor
                </label>
                <input
                  id="distributor_name"
                  name="distributor_name"
                  type="text"
                  maxLength={40}
                  value={form.distributor_name}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
                />
              </div>
              <div className="flex items-center gap-2 w-1/2">
                <label htmlFor="invoice_date" className="w-32.5 text-md font-medium text-gray-700">
                  Invoice Date
                </label>
                <input
                  id="invoice_date"
                  name="invoice_date"
                  type="date"
                  max={new Date().toLocaleDateString("en-CA")}
                  value={form.invoice_date}
                  onChange={handleChange}
                  disabled={submitting}
                  className={`flex-1 px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
                />
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
              COMPLAINT STATUS DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          <div className="flex items-center w-full">
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
            
             <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="updated_time" className="w-76 text-md font-medium text-gray-700 ml-7">
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
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="action_by" className="w-60 text-md font-medium text-gray-700">
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
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="complaint_status" className="w-35 text-md font-medium text-gray-700 ml-7">
                Complaint Status<span className="text-red-500">*</span>
              </label>
              <select
                id="complaint_status"
                name="complaint_status"
                value={form.complaint_status}
                onChange={handleChange}
                disabled={submitting}
                className={`flex-1 min-w-0 px-3 py-1 rounded-lg border ${errs_label.complaint_status ? "border-red-300" : "border-gray-300"} text-gray-900 truncate`}
              >
                <option value="" disabled></option>
                <option value="NEW">NEW</option>
                <option value="FRESH">FRESH</option>
                <option value="PENDING">PENDING</option>
                <option value="ESCALATION">ESCALATION</option>
                <option value="OW">OW</option>
                <option value="CANCEL">CANCEL</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="technician" className="w-60 text-md font-medium text-gray-700">
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
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="complaint_priority" className="w-75 text-md font-medium text-gray-700 ml-7">
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
           <div className="flex items-center w-full gap-3">            
              <label htmlFor="current_status" className="w-42 text-md font-medium text-gray-700">
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
          <div className="flex items-center gap-3 w-full">
              <label htmlFor="action_head" className="w-33 text-md font-medium text-gray-700">
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
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-1/6">
              <label htmlFor="spare_pending" className="w-20 text-md font-medium text-gray-700">
                Spare?
              </label>
              <YesNoToggle
                id="spare_pending"
                value={form.spare_pending}
                onChange={(v) => setForm((prev) => ({ ...prev, spare_pending: v }))}
                disabled={submitting}
              />
            </div>
            <div className="flex items-center gap-2 w-13/3">
              <label htmlFor="spare" className="w-40 text-md font-medium text-gray-700 ml-5">
                Spare Code
              </label>
              <input
                id="spare"
                name="spare"
                type="text"
                maxLength={40}
                value={form.spare}
                onChange={handleChange}
                disabled={submitting || form.spare_pending !== "Y"}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.spare ? "border-red-300" : "border-gray-300"} text-gray-900 ${form.spare_pending !== "Y" ? "bg-gray-100 text-gray-500" : ""}`}
                placeholder={form.spare_pending === "Y" ? "Enter spare code" : "Disabled"}
              />
            </div>
            <div className="flex items-center gap-2 w-2/5">
              <label htmlFor="indent_date" className="w-50 text-md font-medium text-gray-700 ml-5">
                Indent Date
              </label>
              <input
                id="indent_date"
                name="indent_date"
                type="date"
                max={new Date().toLocaleDateString("en-CA")}
                value={form.indent_date}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.indent_date ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2 w-3/5">
              <label htmlFor="indent_so_number" className="w-40 text-md font-medium text-gray-700">
                I-SO Number
              </label>
              <input
                id="indent_so_number"
                name="indent_so_number"
                type="text"
                maxLength={20}
                value={form.indent_so_number}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.indent_so_number ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-2/5">
              <label htmlFor="indent_so_date" className="w-50 text-md font-medium text-gray-700 ml-5">
                I-SO Date
              </label>
              <input
                id="indent_so_date"
                name="indent_so_date"
                type="date"
                max={new Date().toLocaleDateString("en-CA")}
                value={form.indent_so_date}
                onChange={handleChange}
                disabled={submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.indent_so_date ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>
        <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              PAYMENT DETAILS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
          {/* Payment rows: editable only when complaint_status === 'OW' */}
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="payment_collected" className="w-45 text-md font-medium text-gray-700">
                Payment Collected?
              </label>
              <YesNoToggle
                id="payment_collected"
                value={form.payment_collected}
                onChange={(v) => setForm((prev) => ({ ...prev, payment_collected: v }))}
                disabled={form.complaint_status !== "OW" || submitting}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2         ">
              <label htmlFor="payment_mode" className="w-60 text-md font-medium text-gray-700">
                Payment Mode
              </label>
              <select
                id="payment_mode"
                name="payment_mode"
                value={form.payment_mode}
                onChange={handleChange}
                disabled={form.complaint_status !== "OW" || submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.payment_mode ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled></option>
                <option value="CASH">CASH</option>
                <option value="CREDIT">CREDIT</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>
          </div>

          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="amount_sc" className="w-60 text-md font-medium text-gray-700">
                Service Charge
              </label>
              <input
                id="amount_sc"
                name="amount_sc"
                type="number"
                min="0"
                step="1"
                value={form.amount_sc}
                onChange={handleChange}
                disabled={form.complaint_status !== "OW" || submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.amount_sc ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label htmlFor="amount_spare" className="w-60 text-md font-medium text-gray-700">
                Spare Cost
              </label>
              <input
                id="amount_spare"
                name="amount_spare"
                type="number"
                min="0"
                step="1"
                value={form.amount_spare}
                onChange={handleChange}
                disabled={form.complaint_status !== "OW" || submitting}
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.amount_spare ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <label htmlFor="payment_details" className="w-32 text-md font-medium text-gray-700">
              Payment Details
            </label>
            <input
              id="payment_details"
              name="payment_details"
              value={form.payment_details}
              onChange={handleChange}
              disabled={form.complaint_status !== "OW" || submitting}
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.payment_details ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small`}
              maxLength={40}
            />
          </div>
          <div className="w-full flex items-center">
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
            <span
              className="mx-3 text-blue-400 font-semibold text-xs tracking-widest select-none"
              style={{ letterSpacing: 2 }}
            >
              FINAL STATUS
            </span>
            <div className="flex-grow h-0.5 rounded-full bg-gradient-to-l from-blue-200 via-blue-400 to-blue-200 opacity-80 shadow-sm"></div>
          </div>
           <div className="flex items-center w-full">
            <div className="flex-1" />
            <label htmlFor="final_status" className="w-30 text-md font-medium text-gray-700">
                Final Status
              </label>
            <FinalStatusToggle
              form={form}
              setForm={setForm}
              disabled={submitting}
            />
            <div className="flex-1" />
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
      {showRevisitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] flex flex-col items-center">
            <div className="text-lg font-semibold mb-4">Revisit ?</div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
                onClick={() => handleRevisitChoice(true)}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => handleRevisitChoice(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintUpdatePage;
