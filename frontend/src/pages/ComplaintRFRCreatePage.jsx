import React, { useState, useEffect, useRef } from "react";
import Toast from "../components/Toast";
import { FiSearch } from "react-icons/fi";
import { validateCreateRFR } from "../utils/complaintCreateRFRValidation";
import { searchComplaintByNumberRFR } from "../services/complaintSearchByNumberRFRService";
import { createRFR } from "../services/complaintCreateRFRService";
import { fetchComplaintNumbers } from "../services/complaintAllNumbersService";

const initialForm = {
  complaint_number: "",
  complaint_date: "",
  product_division: "",
  customer_type: "",
  customer_name: "",
  customer_address: "",
  product_model: "",
  product_serial_number: "",
  invoice_date: "",
  indent_date: "",
  invoice_number: "",
  purchased_from: "",
  distributor_name: "",
  spare_code: "",
  spare_description: "",
  replacement_reason: "",
  replacement_remark: "",
  current_status: "",
  };

const REPLACEMENT_REASONS = [
  { value: "DOA (DEFECT ON ARRIVAL)", label: "DOA (DEFECT ON ARRIVAL)" },
  { value: "DENT/DAMAGE (NON-REPAIRABLE)", label: "DENT/DAMAGE (NON-REPAIRABLE)" },
  { value: "PART NOT AVAILABLE", label: "PART NOT AVAILABLE" },
  { value: "REPEAT FAILURE", label: "REPEAT FAILURE" },
  { value: "QUALITY ISSUE", label: "QUALITY ISSUE" },
  { value: "OTHERS (EXCEPTIONAL CASES)", label: "OTHERS (EXCEPTIONAL CASES)" },
];

const ComplaintRFRCreatePage = () => {
  const [form, setForm] = useState(initialForm);
  const [complaintNumbers, setComplaintNumbers] = useState([]);
  const [complaintNumberSuggestions, setComplaintNumberSuggestions] = useState(
    [],
  );
  const [showComplaintSuggestions, setShowComplaintSuggestions] =
    useState(false);
  const complaintNumberInputRef = useRef(null);
  const [complaintNumberInputWidth, setComplaintNumberInputWidth] =
    useState("100%");
  const [error, setError] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (complaintNumberInputRef.current) {
      setComplaintNumberInputWidth(
        complaintNumberInputRef.current.offsetWidth + "px",
      );
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

  // Load complaint numbers for suggestions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchComplaintNumbers();
        if (!mounted) return;
        // API returns { complaints: ["N00001", ...] }
        setComplaintNumbers(Array.isArray(data?.complaints) ? data.complaints : []);
      } catch (err) {
        // ignore silently; suggestions will be empty
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearchByNumber = async () => {
    setError({});
    setShowToast(false);
    try {
      const data = await searchComplaintByNumberRFR(form.complaint_number);
      setForm((prev) => ({
        ...prev,
        complaint_date: data.complaint_date ?? "",
        product_division: data.product_division ?? "",
        customer_type: data.customer_type ?? "",
        customer_name: data.customer_name ?? "",
        customer_address: data.customer_address1 + ((" " + data.customer_address2) ? data.customer_address2 : "") + ", " + data.customer_city + " - " + data.customer_pincode,
        product_model: data.product_model ?? "",
        product_serial_number: data.product_serial_number ?? "",
        purchased_from: data.purchased_from ?? "",
        distributor_name: data.distributor_name ?? "",
        invoice_date: data.invoice_date ?? "",
        indent_date: data.indent_date ?? "",
        invoice_number: data.invoice_number ?? "",
        spare_code: data.spare_code ?? "",
        spare_description: data.spare_description ?? "",
        replacement_reason: data.replacement_reason ?? "",
        replacement_remark: data.replacement_remark ?? "",
        current_status: data.current_status ?? "",
      }));
    } catch (err) {
      setError({
        message: err?.message || "Not found",
        resolution: err?.resolution,
        type: "error",
      });
      setShowToast(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
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

  const [errs, errs_label] = validateCreateRFR(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
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
      const payload = {
        complaint_number: form.complaint_number,
        product_model: form.product_model || null,
        product_serial_number: form.product_serial_number || null,
        invoice_date: form.invoice_date || null,
        invoice_number: form.invoice_number || null,
        purchased_from: form.purchased_from || null,
        distributor_name: form.distributor_name || null,
        customer_type: form.customer_type || null,
        current_status: form.current_status || null,
        spare_code: form.spare_code || null,
        spare_description: form.spare_description || null,
        indent_date: form.indent_date || null,
        replacement_reason: form.replacement_reason || null,
        replacement_remark: form.replacement_remark || null,
      };

      await createRFR(payload);

      setError({
        message: "RFR created successfully!",
        resolution: "Complaint Number : " + (form.complaint_number || ""),
        type: "success",
      });
      setShowToast(true);
      setForm(initialForm);
    } catch (err) {
      setError({
        message: err?.message || "Failed to create RFR.",
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
          Create RFR Record
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2">
              <label
                htmlFor="complaint_number"
                className="w-50 text-md font-medium text-blue-700"
              >
                Complaint No.<span className="text-red-500">*</span>
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                }}
              >
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    id="complaint_number"
                    name="complaint_number"
                    type="text"
                    value={form.complaint_number}
                    onChange={handleChange}
                    disabled={submitting }
                    autoComplete="off"
                    className={`w-full px-3 py-1 rounded-lg border ${errs_label.complaint_number ? "border-red-300" : "border-gray-300"} text-gray-900`}
                    maxLength={15}
                    ref={complaintNumberInputRef}
                    onFocus={() => {
                      if (
                        form.complaint_number.length > 0 &&
                        complaintNumberSuggestions.length > 0
                      )
                        setShowComplaintSuggestions(true);
                    }}
                    onBlur={() =>
                      setTimeout(() => setShowComplaintSuggestions(false), 150)
                    }
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
                            setForm((prev) => ({
                              ...prev,
                              complaint_number: n,
                            }));
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
              <label
                htmlFor="complaint_date"
                className="w-60 text-md font-medium text-gray-700"
              >
                Complaint Date
              </label>
              <input
                id="complaint_date"
                name="complaint_date"
                type="text"
                value={formatISOToDisplay(form.complaint_date)}
                readOnly
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border border-gray-300 text-gray-900 cursor-not-allowed`}
              />
            </div>
          </div>
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="product_division"
                className="w-52.5 text-md font-medium text-gray-700"
              >
                Division
              </label>
              <input
                id="product_division"
                name="product_division"
                value={form.product_division}
                disabled={submitting }
                readOnly
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.product_division ? "border-red-300" : "border-gray-300"} text-gray-900 cursor-not-allowed`}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="customer_type"
                className="w-59 text-md font-medium text-gray-700"
              >
                Customer Type<span className="text-red-500">*</span>
              </label>
              <select
                id="customer_type"
                name="customer_type"
                value={form.customer_type}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.customer_type ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled></option>
                <option value="DEALER">DEALER</option>
                <option value="CUSTOMER">END-USER</option>
              </select>
            </div>
          </div>
          <div
            className="flex items-center gap-3 w-full"
            style={{ position: "relative" }}
          >
            <label
              htmlFor="customer_name"
              className="w-29.5 text-md font-medium text-gray-700"
            >
              Name
            </label>
            <div className="flex-1 flex items-center gap-2">
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={form.customer_name}
                  className={`w-full px-3 py-1 rounded-lg border ${errs_label.customer_name ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
                  readOnly
                  disabled={submitting }
                />
                
              </div>
             
            </div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <label
              htmlFor="customer_address"
              className="w-29.5 text-md font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="customer_address"
              name="customer_address"
              value={form.customer_address}
              readOnly
              className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.customer_address ? "border-red-300" : "border-gray-300"} bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 font-small cursor-not-allowed`}
              autoComplete="street-address"
              disabled={submitting }
            />
          </div>
         
    
          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="product_model"
                className="w-52 text-md font-medium text-gray-700"
              >
                Product Model<span className="text-red-500">*</span>
              </label>
              <input
                id="product_model"
                name="product_model"
                type="text"
                maxLength={25}
                value={form.product_model}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.product_model ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="product_serial_number"
                className="w-58 text-md font-medium text-gray-700"
              >
                Serial Number<span className="text-red-500">*</span>
              </label>
              <input
                id="product_serial_number"
                name="product_serial_number"
                type="text"
                maxLength={20}
                value={form.product_serial_number}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.product_serial_number ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>

          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="purchased_from"
                className="w-52 text-md font-medium text-gray-700"
              >
                Purchased From
              </label>
              <input
                id="purchased_from"
                name="purchased_from"
                type="text"
                maxLength={40}
                value={form.purchased_from}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.purchased_from ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="invoice_number"
                className="w-58 text-md font-medium text-gray-700"
              >
                Invoice Number
              </label>
              <input
                id="invoice_number"
                name="invoice_number"
                type="text"
                maxLength={25}
                value={form.invoice_number}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.invoice_number ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>

          <div className="flex items-center w-full gap-7">
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="distributor_name"
                className="w-52 text-md font-medium text-gray-700"
              >
                Distributor
              </label>
              <input
                id="distributor_name"
                name="distributor_name"
                type="text"
                maxLength={40}
                value={form.distributor_name}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.distributor_name ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="invoice_date"
                className="w-32.5 text-md font-medium text-gray-700"
              >
                Invoice Date
              </label>
              <input
                id="invoice_date"
                name="invoice_date"
                type="date"
                max={new Date().toLocaleDateString("en-CA")}
                value={form.invoice_date}
                onChange={handleChange}
                disabled={submitting }
                className={`flex-1 px-3 py-1 rounded-lg border ${errs_label.invoice_date ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
          </div>      
          <div className="flex items-center w-full gap-7">         
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="spare_code"
                className="w-52 text-md font-medium text-gray-700"
              >
                Spare Code
              </label>
              <input
                id="spare_code"
                name="spare_code"
                type="text"
                maxLength={30}
                value={form.spare_code}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.spare_code ? "border-red-300" : "border-gray-300"} text-gray-900`}
              />
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <label
                htmlFor="indent_date"
                className="w-32.5 text-md font-medium text-gray-700"
              >
                Indent Date
              </label>
              <input
                id="indent_date"
                name="indent_date"
                type="date"
                max={new Date().toLocaleDateString("en-CA")}
                value={form.indent_date}
                onChange={handleChange}
                disabled={submitting }
                className={`flex-1 px-3 py-1 rounded-lg border border-gray-300 text-gray-900`}
              />
            </div>
          
          </div>
          <div className="flex items-center w-full gap-3">
              <label
              htmlFor="spare_description"
              className="w-54 text-md font-medium text-gray-700"
            >
              Spare Description
            </label>
            <input
              id="spare_description"
              name="spare_description"
              value={form.spare_description}
              maxLength={40}
              onChange={handleChange}
              disabled={submitting }
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.spare_description ? "border-red-300" : "border-gray-300"} text-gray-900`}
            />
          </div>
           <div className="flex items-center w-full gap-3">
            <label
                htmlFor="replacement_reason"
                className="w-54 text-md font-medium text-gray-700"
              >
                Replacement Reason<span className="text-red-500">*</span>
              </label>
              <select
                id="replacement_reason"
                name="replacement_reason"
                value={form.replacement_reason}
                onChange={handleChange}
                disabled={submitting }
                className={`w-full px-3 py-1 rounded-lg border ${errs_label.replacement_reason ? "border-red-300" : "border-gray-300"} text-gray-900`}
              >
                <option value="" disabled></option>
                {REPLACEMENT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
          </div>
          <div className="flex items-center w-full gap-3">
            <label
              htmlFor="replacement_remark"
              className="w-54 text-md font-medium text-gray-700"
            >
              Replacement Remark<span className="text-red-500">*</span>
            </label>
            <input
              id="replacement_remark"
              name="replacement_remark"
              type="text"
              required
              maxLength={40}
              value={form.replacement_remark}
              onChange={handleChange}
              disabled={submitting }
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.replacement_remark ? "border-red-300" : "border-gray-300"} text-gray-900`}
            />
          </div>
           <div className="flex items-center w-full gap-3">
            <label
              htmlFor="current_status"
              className="w-54 text-md font-medium text-gray-700"
            >
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
              disabled={submitting }
              className={`w-full px-3 py-1 rounded-lg border ${errs_label.current_status ? "border-red-300" : "border-gray-300"} text-gray-900`}
            />
          </div>
       
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="py-1.5 px-6 rounded-lg bg-blue-600 text-white font-bold text-base shadow hover:bg-blue-900 transition-colors duration-200 w-fit disabled:opacity-60"
            disabled={submitting }
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

export default ComplaintRFRCreatePage;
