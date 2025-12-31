import React, { useEffect, useState } from "react";
// Inline Filter component with filter fields
import { Container } from "@mui/material";
import EnquiryTableCGPISL from "../components/EnquiryTableCGPISL.jsx";
import ShowToast from "../components/Toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { stockCGPISLEnquiry } from "../services/stockCGPISLEnquiryService";
import { fetchStockCGPISLList } from "../services/stockCGPISLStockListService.js";

const columns = [
  { key: "spare_code", label: "Spare Code" },
  { key: "spare_description", label: "Spare Description" },
  { key: "division", label: "Division" },
  { key: "cnf_qty", label: "CNF Quantity" },
  { key: "grc_qty", label: "GRC Quantity" },
  { key: "own_qty", label: "Own Stock" },
  { key: "alp", label: "ALP" },
];

const divisionOptions = [
  "FANS",
  "PUMP",
  "SDA",
  "WHC",
  "FHP",
  "LT",
  "HT",
  "OTHERS",
];

const Filter = ({
  open = false,
  onToggle,
  spareDescription,
  setSpareDescription,
  division,
  setDivision,
  cnf,
  setCnf,
  grc,
  setGrc,
  own,
  setOwn,
  spareCode,
  setSpareCode,
  spareCodes,
  spareDescriptions,
  onSearch,
  onClear,
}) => {
  const [spareCodeSuggestions, setSpareCodeSuggestions] = useState([]);
  const [showSpareCodeSuggestions, setShowSpareCodeSuggestions] =
    useState(false);
  const isTypingSpareCodeRef = React.useRef(false);
  const isTypingSpareDescriptionRef = React.useRef(false);

  const [spareDescriptionSuggestions, setSpareDescriptionSuggestions] =
    useState([]);
  const [showSpareDescriptionSuggestions, setShowSpareDescriptionSuggestions] =
    useState(false);

  useEffect(() => {
    if (!isTypingSpareCodeRef.current) {
      setShowSpareCodeSuggestions(false);
      return;
    }

    if (spareCode && spareCodes.length > 0) {
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
    if (!isTypingSpareDescriptionRef.current) {
      setShowSpareDescriptionSuggestions(false);
      return;
    }

    if (spareDescription && spareDescriptions.length > 0) {
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
              onChange={(e) => {
                isTypingSpareCodeRef.current = true;
                setSpareCode(e.target.value);
              }}
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
                boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #2e7d32")}
              onBlur={() => {
                isTypingSpareCodeRef.current = false;
                setShowSpareCodeSuggestions(false);
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
                      isTypingSpareCodeRef.current = false;
                      setSpareCode(n);
                      setShowSpareCodeSuggestions(false);
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
              onChange={(e) => {
                isTypingSpareDescriptionRef.current = true;
                setSpareDescription(e.target.value);
              }}
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
                boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",              }}
              onFocus={(e) => (e.target.style.border = "1.5px solid #2e7d32")}
              onBlur={() => {
                isTypingSpareDescriptionRef.current = false;
                setShowSpareDescriptionSuggestions(false);
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
                      isTypingSpareDescriptionRef.current = false;
                      setSpareDescription(n);
                      setShowSpareDescriptionSuggestions(false);
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
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",                  width: "100%",
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
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <label
                htmlFor="cnf"
                style={{
                  fontWeight: 600,
                  color: "#2e7d32",
                  letterSpacing: 0.5,
                  fontSize: 13,
                  width: 150,
                }}
              >
                CNF
              </label>
              <select
                id="cnf"
                name="cnf"
                value={cnf}
                onChange={(e) => setCnf(e.target.value)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",                  width: "100%",
                }}
              >
                <option value=""></option>
                <option value="Y">Available</option>
                <option value="N">Not Available</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <label
                htmlFor="grc"
                style={{
                  fontWeight: 600,
                  color: "#2e7d32",
                  letterSpacing: 0.5,
                  fontSize: 13,
                  width: 150,
                }}
              >
                GRC
              </label>
              <select
                id="grc"
                name="grc"
                value={grc}
                onChange={(e) => setGrc(e.target.value)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",                  width: "100%",
                }}
              >
                <option value=""></option>
                <option value="Y">Available</option>
                <option value="N">Not Available</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <label
                htmlFor="own"
                style={{
                  fontWeight: 600,
                  color: "#2e7d32",
                  letterSpacing: 0.5,
                  fontSize: 13,
                  width: 150,
                }}
              >
                Own
              </label>
              <select
                id="own"
                name="own"
                value={own}
                onChange={(e) => setOwn(e.target.value)}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46, 125, 50, 0.08)",                  width: "100%",
                }}
              >
                <option value=""></option>
                <option value="Y">Available</option>
                <option value="N">Not Available</option>
              </select>
            </div>
          </div>
          {/* Centered Search & Clear Buttons */}
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

const StockCGPISLEnquiryPage = () => {
  const [division, setDivision] = useState("");
  const [spareDescription, setSpareDescription] = useState("");
  const [spareCode, setSpareCode] = useState("");
  const [cnf, setCnf] = useState("");
  const [grc, setGrc] = useState("");
  const [own, setOwn] = useState("");
  // Data states

  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false); // Don't load on mount
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(true);
  const [searched, setSearched] = useState(false);
  const [spareCodes, setSpareCodes] = useState([]);
  const [spareDescriptions, setSpareDescriptions] = useState([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const handleClear = () => {
    setDivision("");
    setSpareDescription("");
    setSpareCode("");
    setCnf("");
    setGrc("");
    setOwn("");
    setSearched(false);
    setData([]);
    setError(null);
    setPage(1);
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

  // Fetch data when page/limit changes or after search

  const fetchData = async (params = {}, pageNum = page, pageLimit = limit) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (pageNum - 1) * pageLimit;
      const res = await stockCGPISLEnquiry(params, pageLimit, offset);
      if (res && typeof res === "object" && Array.isArray(res.records)) {
        setData(res.records);
        setTotalRecords(res.total_records || 0);
      } else if (Array.isArray(res)) {
        setData(res);
        setTotalRecords(res.length);
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      setData([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  // Handler for search button
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setFilterOpen(false);
    setPage(1);
    const params = {};
    if (spareDescription) params.spare_description = spareDescription;
    if (spareCode) params.spare_code = spareCode;
    if (division) params.division = division;
    if (cnf) params.cnf = cnf;
    if (grc) params.grc = grc;
    if (own) params.own = own;
    await fetchData(params, 1, limit);
    setLoading(false);
  };

  // Handler for page change
  const handlePageChange = async (newPage) => {
    setPage(newPage);
    const params = {};
    if (spareDescription) params.spare_description = spareDescription;
    if (spareCode) params.spare_code = spareCode;
    if (division) params.division = division;
    if (cnf) params.cnf = cnf;
    if (grc) params.grc = grc;
    if (own) params.own = own;
    await fetchData(params, newPage, limit);
  };

  // Handler for limit change
  const handleLimitChange = async (e) => {
    const newLimit = parseInt(e.target.value, 10) || 100;
    setLimit(newLimit);
    setPage(1);
    const params = {};
    if (spareDescription) params.spare_description = spareDescription;
    if (spareCode) params.spare_code = spareCode;
    if (division) params.division = division;
    if (cnf) params.cnf = cnf;
    if (grc) params.grc = grc;
    if (own) params.own = own;
    await fetchData(params, 1, newLimit);
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
        cnf={cnf}
        setCnf={setCnf}
        grc={grc}
        setGrc={setGrc}
        own={own}
        setOwn={setOwn}
        spareCodes={spareCodes}
        spareDescriptions={spareDescriptions}
        onSearch={handleSearch}
        onClear={handleClear}
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
            data={data}
            columns={columns}
            title="Stock CGPISL Enquiry List"
            sum_column="amount"
            total_records={totalRecords}
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
          {/* Pagination Controls */}
          {searched && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 24,
                gap: 8,
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  position: "relative",
                }}
              >
                {/* Centered Pagination Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 16,
                    flex: 1,
                  }}
                >
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      background: "#2e7d32",
                      color: "#fff",
                      border: "none",
                      fontWeight: "bold",
                      fontSize: 15,
                      cursor: page === 1 ? "not-allowed" : "pointer",
                      opacity: page === 1 ? 0.6 : 1,
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>
                    Page {page}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={data.length < limit || loading}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      background: "#2e7d32",
                      color: "#fff",
                      border: "none",
                      fontWeight: "bold",
                      fontSize: 15,
                      cursor: data.length < limit ? "not-allowed" : "pointer",
                      opacity: data.length < limit ? 0.6 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
                {/* Rows per page selector aligned right */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <label style={{ fontWeight: 500 }}>
                    Rows per page:
                    <select
                      value={limit}
                      onChange={handleLimitChange}
                      style={{
                        marginLeft: 8,
                        padding: "4px 8px",
                        borderRadius: 4,
                      }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default StockCGPISLEnquiryPage;
