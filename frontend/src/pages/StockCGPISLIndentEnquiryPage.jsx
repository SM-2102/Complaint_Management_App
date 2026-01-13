import React, { useEffect, useState } from "react";
// Inline Filter component with filter fields
import { Container } from "@mui/material";
import EnquiryTableCGPISL from "../components/EnquiryTableCGPISL.jsx";
import ShowToast from "../components/Toast.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { stockCGPISLIndentEnquiry } from "../services/stockCGPISLIndentEnquiryService.js";
import { fetchStockCGPISLList } from "../services/stockCGPISLStockListService.js";

const columns = [
  { key: "index", label: "Sl. No." },
  { key: "indent_number", label: "Indent Number" },
  { key: "indent_date", label: "Date" },
  { key: "spare_code", label: "Spare Code" },
  { key: "spare_description", label: "Spare Description" },
  { key: "indent_qty", label: "Quantity" },
  { key: "party_name", label: "Party Name" },
];

const divisionOptions = [
 "CG-FANS",
    "CG-SDA",
    "CG-LT",
    "CG-FHP",
    "CG-PUMP",
    "CG-WHC",
];

const Filter = ({
  open = false,
  onToggle,
  spareDescription,
  setSpareDescription,
  division,
  setDivision,
  spareCode,
  setSpareCode,
  spareCodes,
  spareDescriptions,
  onSearch,
  onClear,
  fromIndentDate,
  setFromIndentDate,
  toIndentDate,
  setToIndentDate,
  fromIndentNumber,
  setFromIndentNumber,
  toIndentNumber,
  setToIndentNumber,
}) => {
  const [spareCodeSuggestions, setSpareCodeSuggestions] = useState([]);
  const [showSpareCodeSuggestions, setShowSpareCodeSuggestions] =
    useState(false);
  const spareCodeSuggestionClickedRef = React.useRef(false);

  const [spareDescriptionSuggestions, setSpareDescriptionSuggestions] =
    useState([]);
  const [showSpareDescriptionSuggestions, setShowSpareDescriptionSuggestions] =
    useState(false);
  const spareDescriptionSuggestionClickedRef = React.useRef(false);

  useEffect(() => {
    if (spareCodeSuggestionClickedRef.current) {
      setShowSpareCodeSuggestions(false);
      setSpareCodeSuggestions([]);
      spareCodeSuggestionClickedRef.current = false;
      return;
    }
    if (spareCode && spareCodes && spareCodes.length > 0) {
      const filtered = spareCodes.filter((n) =>
        n.toLowerCase().includes(spareCode.toLowerCase()),
      );
      setSpareCodeSuggestions(filtered);
      setShowSpareCodeSuggestions(filtered.length > 0);
    } else {
      setShowSpareCodeSuggestions(false);
    }
  }, [spareCode, spareCodes]);

  useEffect(() => {
    if (spareDescriptionSuggestionClickedRef.current) {
      setShowSpareDescriptionSuggestions(false);
      setSpareDescriptionSuggestions([]);
      spareDescriptionSuggestionClickedRef.current = false;
      return;
    }
    if (spareDescription && spareDescriptions && spareDescriptions.length > 0) {
      const filtered = spareDescriptions.filter((n) =>
        n.toLowerCase().includes(spareDescription.toLowerCase()),
      );
      setSpareDescriptionSuggestions(filtered);
      setShowSpareDescriptionSuggestions(filtered.length > 0);
    } else {
      setShowSpareDescriptionSuggestions(false);
    }
  }, [spareDescription, spareDescriptions]);
  return (
    <>
      <div
        className={`fixed right-0 w-65 max-w-[90vw] z-[1200] transition-transform duration-300
						   ${open ? "translate-x-0" : "translate-x-full"} bg-black/10 backdrop-blur-xl shadow-2xl
						   top-[88px] bottom-[0px] rounded-l-md overflow-hidden flex flex-col animate-fade-in`}
        style={{ maxHeight: "calc(100vh - 88px)", overflowY: "auto" }}
      >
        <div style={{ padding: 15, marginTop: 5 }}>
          {/* Elegant filter fields */}
          <div style={{ marginBottom: 10, position: "relative" }}>
            <label
              htmlFor="spareCode"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 4,
                display: "block",
              }}
            >
              Spare Code
            </label>
            <input
              type="text"
              id="spareCode"
              name="spareCode"
              value={spareCode}
              onChange={(e) => setSpareCode(e.target.value)}
              placeholder="Spare Code"
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                background: "#f7f9fc",
                transition: "border 0.2s",
                outline: "none",
                boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
              }}
              onBlur={(e) => {
                if (!spareCodeSuggestionClickedRef.current) {
                  setShowSpareCodeSuggestions(false);
                }
              }}
            />
            {showSpareCodeSuggestions && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 10,
                  background: "#fff",
                  border: "0.5px solid #d1d5db",
                  borderRadius: "0.25rem",
                  boxShadow: "0 2px 8px rgba(46,125,50,0.12)",
                  width: "100%",
                  maxHeight: 160,
                  overflowY: "auto",
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {spareCodeSuggestions.map((n) => (
                  <li
                    key={n}
                    style={{
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#0a1825ff",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                    onMouseDown={() => {
                      spareCodeSuggestionClickedRef.current = true;
                      setSpareCode(n);
                      setShowSpareCodeSuggestions(false);
                      setSpareCodeSuggestions([]);
                    }}
                  >
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ marginBottom: 10, position: "relative" }}>
            <label
              htmlFor="spareDescription"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 4,
                display: "block",
              }}
            >
              Spare Description
            </label>
            <input
              type="text"
              id="spareDescription"
              name="spareDescription"
              value={spareDescription}
              onChange={(e) => setSpareDescription(e.target.value)}
              placeholder="Spare Description"
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                background: "#f7f9fc",
                transition: "border 0.2s",
                outline: "none",
                boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
              }}
              onBlur={(e) => {
                if (!spareDescriptionSuggestionClickedRef.current) {
                  setShowSpareDescriptionSuggestions(false);
                }
              }}
            />
            {showSpareDescriptionSuggestions && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 10,
                  background: "#fff",
                  border: "0.5px solid #d1d5db",
                  borderRadius: "0.25rem",
                  boxShadow: "0 2px 8px rgba(46,125,50,0.12)",
                  width: "100%",
                  maxHeight: 160,
                  overflowY: "auto",
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                }}
              >
                {spareDescriptionSuggestions.map((n) => (
                  <li
                    key={n}
                    style={{
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#0a1825ff",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                    onMouseDown={() => {
                      spareDescriptionSuggestionClickedRef.current = true;
                      setSpareDescription(n);
                      setShowSpareDescriptionSuggestions(false);
                      setSpareDescriptionSuggestions([]);
                    }}
                  >
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <label
                htmlFor="division"
                style={{
                  fontWeight: 600,
                  color: "#2e7d32",
                  letterSpacing: 0.5,
                  fontSize: 13,
                  width: 150,
                }}
              >
                Division
              </label>
              <select
                id="division"
                name="division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
                  width: "100%",
                }}
              >
                <option value=""></option>
                {divisionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="fromIndentNumber"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 4,
                display: "block",
              }}
            >
              Indent Number
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ minWidth: 60, fontSize: 13, color: "#333" }}>
                From
              </span>
              <input
                type="text"
                id="fromIndentNumber"
                name="fromIndentNumber"
                value={fromIndentNumber}
                onChange={(e) => setFromIndentNumber(e.target.value)}
                placeholder="From Indent Number"
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ minWidth: 60, fontSize: 13, color: "#333" }}>
                To
              </span>
              <input
                type="text"
                id="toIndentNumber"
                name="toIndentNumber"
                value={toIndentNumber}
                onChange={(e) => setToIndentNumber(e.target.value)}
                placeholder="To Indent Number"
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="fromIndentDate"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 4,
                display: "block",
              }}
            >
              Indent Date
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ minWidth: 60, fontSize: 13, color: "#333" }}>
                From
              </span>
              <input
                type="date"
                id="fromIndentDate"
                name="fromIndentDate"
                value={fromIndentDate}
                onChange={(e) => setFromIndentDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ minWidth: 60, fontSize: 13, color: "#333" }}>
                To
              </span>
              <input
                type="date"
                id="toIndentDate"
                name="toIndentDate"
                value={toIndentDate}
                onChange={(e) => setToIndentDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
              gap: 16,
            }}
          >
            <button
              onClick={onSearch}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(90deg, #2e7d32 60%, #1b5e20 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: "bold",
                fontSize: 15,
                boxShadow: "0 2px 8px rgba(46,125,50,0.12)",
                cursor: "pointer",
                letterSpacing: 1,
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              Search
            </button>
            <button
              onClick={onClear}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(90deg, #2e7d32 60%, #1b5e20 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: "bold",
                fontSize: 15,
                boxShadow: "0 2px 8px rgba(46,125,50,0.12)",
                cursor: "pointer",
                letterSpacing: 1,
                marginLeft: 8,
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      <div
        onClick={onToggle}
        className={`fixed top-1/5 -translate-y-1/2 z-[3000] flex items-center gap-2 bg-green-900 text-white shadow-lg cursor-pointer
					       px-4 py-3 rounded-l-xl select-none transition-all duration-300 ${open ? "right-65" : "right-0"}`}
        title="Toggle Filter Bar"
      >
        {open ? (
          <FaChevronRight className="text-base" />
        ) : (
          <FaChevronLeft className="text-base" />
        )}
        <span className="text-md font-bold">Filter</span>
      </div>
    </>
  );
};

const StockCGPISLIndentEnquiryPage = () => {
  const [division, setDivision] = useState("");
  const [spareDescription, setSpareDescription] = useState("");
  const [spareCode, setSpareCode] = useState("");
  const [available, setAvailable] = useState("");
  const [fromIndentDate, setFromIndentDate] = useState("");
  const [toIndentDate, setToIndentDate] = useState("");
  // Data states

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // Don't load on mount
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(true);
  const [searched, setSearched] = useState(false);
  const [spareCodes, setSpareCodes] = useState([]);
  const [spareDescriptions, setSpareDescriptions] = useState([]);
  const [fromIndentNumber, setFromIndentNumber] = useState("");
  const [toIndentNumber, setToIndentNumber] = useState("");

  const handleClear = () => {
    setDivision("");
    setSpareDescription("");
    setSpareCode("");
    setAvailable("");
    setFromIndentDate("");
    setToIndentDate("");
    setFromIndentNumber("");
    setToIndentNumber("");
    setSearched(false);
    setData([]);
    setError(null);
  };

  useEffect(() => {
    let mounted = true;
    fetchStockCGPISLList()
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setSpareCodes(data.map((item) => item.spare_code));
          setSpareDescriptions(data.map((item) => item.spare_description));
        }
      })
      .catch(() => {
        setSpareCodes([]);
        setSpareDescriptions([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handler for search button
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setFilterOpen(false);
    try {
      // Update fetchIndentEnquiry to accept params
      const params = {};
      if (spareDescription) params.spare_description = spareDescription;
      if (spareCode) params.spare_code = spareCode;
      if (division) params.division = division;
      if (available) params.available = available;
      if (fromIndentDate) params.from_indent_date = fromIndentDate;
      if (toIndentDate) params.to_indent_date = toIndentDate;
      if (fromIndentNumber) params.from_indent_number = fromIndentNumber;
      if (toIndentNumber) params.to_indent_number = toIndentNumber;
      const res = await stockCGPISLIndentEnquiry(params);
      // Add index property to each row (for display)
      const indexedRes = Array.isArray(res)
        ? res.map((row, idx) => ({ ...row, index: idx + 1 }))
        : [];
      setData(indexedRes);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      setData([]);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Filter Bar for searching/filtering UI */}
      <Filter
        open={filterOpen}
        onToggle={() => setFilterOpen((prev) => !prev)}
        division={division}
        setDivision={setDivision}
        spareDescription={spareDescription}
        setSpareDescription={setSpareDescription}
        spareCode={spareCode}
        setSpareCode={setSpareCode}
        available={available}
        setAvailable={setAvailable}
        spareCodes={spareCodes}
        spareDescriptions={spareDescriptions}
        onSearch={handleSearch}
        onClear={handleClear}
        fromIndentDate={fromIndentDate}
        setFromIndentDate={setFromIndentDate}
        toIndentDate={toIndentDate}
        setToIndentDate={setToIndentDate}
        fromIndentNumber={fromIndentNumber}
        setFromIndentNumber={setFromIndentNumber}
        toIndentNumber={toIndentNumber}
        setToIndentNumber={setToIndentNumber}
      />
      {/* Results or placeholder */}
      {error ? (
        <ShowToast
          type="error"
          message="Cannot load Stock CGPISL data"
          resolution="Try again later"
        />
      ) : (
        <>
          <EnquiryTableCGPISL
            data={data.map((row, idx) => ({ ...row, index: idx + 1 }))}
            columns={columns}
            title="Stock CGPISL Indent Enquiry List"
            sum_column="amount"
            noDataMessage={
              searched && data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      color: "#888",
                      fontStyle: "italic",
                      padding: "24px 0",
                    }}
                  >
                    No records found
                  </td>
                </tr>
              ) : null
            }
          />
        </>
      )}
    </Container>
  );
};

export default StockCGPISLIndentEnquiryPage;
