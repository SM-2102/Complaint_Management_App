import React, { useEffect, useState } from "react";
// Inline Filter component with filter fields
import { Container } from "@mui/material";
import EnquiryTableCGPISL from "../components/EnquiryTableCGPISL.jsx";
import ShowToast from "../components/Toast.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { grcCGPISLEnquiry } from "../services/grcCGPISLEnquiryService.js";
import { fetchStockCGPISLList } from "../services/stockCGPISLStockListService.js";

const columns = [
  { key: "grc_number", label: "GRC Number" },
  { key: "grc_date", label: "GRC Date" },
  { key: "ageing_in_days", label: "Ageing (Days)" },
  { key: "spare_code", label: "Spare Code" },
  { key: "spare_description", label: "Spare Description" },
  { key: "issue_qty", label: "Issue Qty" },
  { key: "grc_pending_qty", label: "Pending Qty" },
  { key: "returning_qty", label: "Returning Qty" },
  { key: "dispute_remark", label: "Dispute Remark" },
  { key: "challan_number", label: "Challan Number" },
  { key: "challan_date", label: "Challan Date" },
  { key: "docket_number", label: "Docket Number" },
];
  // Helper to calculate ageing in days (supports dd-mm-yyyy)
  const calculateAgeing = (grcDate) => {
    if (!grcDate) return "-";
    let date;
    // Handle dd-mm-yyyy format
    if (/^\d{2}-\d{2}-\d{4}$/.test(grcDate)) {
      const [day, month, year] = grcDate.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(grcDate);
    }
    if (isNaN(date.getTime())) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diff = today - date;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

const divisionOptions = ["CG-FANS",
    "CG-SDA",
    "CG-LT",
    "CG-FHP",
    "CG-PUMP",
    "CG-WHC",];

const Filter = ({
  open = false,
  onToggle,
  spareCode,
  setSpareCode,
  spareCodes,
  division,
  setDivision,
  onSearch,
  onClear,
  fromGRCDate,
  setFromGRCDate,
  toGRCDate,
  setToGRCDate,
  GRCNumber,
  setGRCNumber,
  challanNumber,
  setChallanNumber,
  GRCStatus,
  setGRCStatus,
}) => {
  const [spareCodeSuggestions, setSpareCodeSuggestions] = useState([]);
  const [showSpareCodeSuggestions, setShowSpareCodeSuggestions] =
    useState(false);
  const isTypingSpareCodeRef = React.useRef(false);
  useEffect(() => {
    if (GRCStatus === "N") {
      setChallanNumber("");
    }
  }, [GRCStatus]);
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

  return (
    <>
      <div
        className={`fixed right-0 w-65 max-w-[90vw] z-[1200] transition-transform duration-300
						   ${open ? "translate-x-0" : "translate-x-full"} bg-black/10 backdrop-blur-xl shadow-2xl
						   top-[88px] bottom-[0px] rounded-l-md overflow-hidden flex flex-col animate-fade-in`}
        style={{ maxHeight: "calc(100vh - 88px)", overflowY: "auto" }}
      >
        <div style={{ padding: 15, marginTop: 5 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <label
                htmlFor="division"
                style={{
                  fontWeight: 600,
                  color: "#2e7d32",
                  letterSpacing: 0.5,
                  fontSize: 13,
                  width: 140,
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
                  boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
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
                boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
              }}
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
                  boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
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
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <label
              htmlFor="GRCNumber"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 0,
                display: "block",
                minWidth: 80,
              }}
            >
              GRC No.
            </label>
            <input
              id="GRCNumber"
              name="GRCNumber"
              value={GRCNumber}
              type="text"
              onChange={(e) => setGRCNumber(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                background: "#f7f9fc",
                outline: "none",
                boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <label
              htmlFor="challanNumber"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 0,
                display: "block",
                minWidth: 80,
              }}
            >
              Challan No.
            </label>
            <input
              id="challanNumber"
              name="challanNumber"
              value={challanNumber}
              type="text"
              disabled={GRCStatus === "N"}
              onChange={(e) => setChallanNumber(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                background: GRCStatus === "N" ? "#e5e7eb" : "#f7f9fc",
                color: GRCStatus === "N" ? "#6b7280" : "#111827",
                cursor: GRCStatus === "N" ? "not-allowed" : "text",
                outline: "none",
                boxShadow:
                  GRCStatus === "N" ? "none" : "0 1px 2px rgba(46,125,50,0.08)",
                width: "100%",
              }}
            />
          </div>
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <label
              htmlFor="GRCStatus"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                width: 140,
              }}
            >
              GRC Status
            </label>
            <select
              id="GRCStatus"
              name="GRCStatus"
              value={GRCStatus}
              onChange={(e) => setGRCStatus(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 13,
                background: "#f7f9fc",
                outline: "none",
                boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
                width: "100%",
              }}
            >
              <option value="N">Pending</option>
              <option value="Y">Already Sent</option>
            </select>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="fromGRCDate"
              style={{
                fontWeight: 600,
                color: "#2e7d32",
                letterSpacing: 0.5,
                fontSize: 13,
                marginBottom: 4,
                display: "block",
              }}
            >
              GRC Date
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ minWidth: 80, fontSize: 13, color: "#333" }}>
                From
              </span>
              <input
                type="date"
                id="fromGRCDate"
                name="fromGRCDate"
                value={fromGRCDate}
                onChange={(e) => setFromGRCDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ minWidth: 80, fontSize: 13, color: "#333" }}>
                To
              </span>
              <input
                type="date"
                id="toGRCDate"
                name="toGRCDate"
                value={toGRCDate}
                onChange={(e) => setToGRCDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: 13,
                  background: "#f7f9fc",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(46,125,50,0.08)",
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
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
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
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

const GRCCGPISLEnquiryPage = () => {
  const [division, setDivision] = useState("");
  const [fromGRCDate, setFromGRCDate] = useState("");
  const [toGRCDate, setToGRCDate] = useState("");
  const [spareCode, setSpareCode] = useState("");
  // Data states

  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false); // Don't load on mount
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(true);
  const [searched, setSearched] = useState(false);
  const [GRCNumber, setGRCNumber] = useState("");
  const [challanNumber, setChallanNumber] = useState("");
  const [spareCodes, setSpareCodes] = useState([]);
  const [GRCStatus, setGRCStatus] = useState("N");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const handleClear = () => {
    setDivision("");
    setFromGRCDate("");
    setToGRCDate("");
    setSpareCode("");
    setGRCNumber("");
    setChallanNumber("");
    setGRCStatus("");
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
        }
      })
      .catch(() => {
        setSpareCodes([]);
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
      const res = await grcCGPISLEnquiry(params, pageLimit, offset);
      let records = [];
      let total = 0;
      if (res && typeof res === "object" && Array.isArray(res.records)) {
        records = res.records;
        total = res.total_records || 0;
      } else if (Array.isArray(res)) {
        records = res;
        total = res.length;
      }
      // Add ageing_in_days to each record
      const recordsWithAgeing = records.map((row) => ({
        ...row,
        ageing_in_days: calculateAgeing(row.grc_date),
      }));
      setData(recordsWithAgeing);
      setTotalRecords(total);
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
    setPage(1); // Reset to first page on new search

    const params = {};
    if (division) params.division = division;
    if (spareCode) params.spare_code = spareCode;

    if (fromGRCDate) params.from_grc_date = fromGRCDate;
    if (toGRCDate) params.to_grc_date = toGRCDate;
    if (GRCNumber) params.grc_number = GRCNumber;
    if (challanNumber) params.challan_number = challanNumber;
    if (GRCStatus) params.grc_status = GRCStatus;
    await fetchData(params, 1, limit);
    setLoading(false);
  };

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    const params = {};
    if (division) params.division = division;
    if (spareCode) params.spare_code = spareCode;

    if (fromGRCDate) params.from_grc_date = fromGRCDate;
    if (toGRCDate) params.to_grc_date = toGRCDate;
    if (GRCNumber) params.grc_number = GRCNumber;
    if (challanNumber) params.challan_number = challanNumber;
    if (GRCStatus) params.grc_status = GRCStatus;
    await fetchData(params, newPage, limit);
  };

  const handleLimitChange = async (e) => {
    const newLimit = parseInt(e.target.value, 10) || 100;
    setLimit(newLimit);
    setPage(1);
    const params = {};
    if (division) params.division = division;
    if (spareCode) params.spare_code = spareCode;

    if (fromGRCDate) params.from_grc_date = fromGRCDate;
    if (toGRCDate) params.to_grc_date = toGRCDate;
    if (GRCNumber) params.grc_number = GRCNumber;
    if (challanNumber) params.challan_number = challanNumber;
    if (GRCStatus) params.grc_status = GRCStatus;
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
        onSearch={handleSearch}
        onClear={handleClear}
        fromGRCDate={fromGRCDate}
        setFromGRCDate={setFromGRCDate}
        toGRCDate={toGRCDate}
        setToGRCDate={setToGRCDate}
        GRCNumber={GRCNumber}
        setGRCNumber={setGRCNumber}
        challanNumber={challanNumber}
        setChallanNumber={setChallanNumber}
        GRCStatus={GRCStatus}
        setGRCStatus={setGRCStatus}
        spareCode={spareCode}
        setSpareCode={setSpareCode}
        spareCodes={spareCodes}
      />
      {/* Results or placeholder */}
      {error ? (
        <ShowToast
          type="error"
          message="Cannot load GRC CGPISL data"
          resolution="Try again later"
        />
      ) : (
        <>
          <EnquiryTableCGPISL
            data={data}
            columns={columns}
            title="GRC CGPISL Enquiry List"
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

export default GRCCGPISLEnquiryPage;
