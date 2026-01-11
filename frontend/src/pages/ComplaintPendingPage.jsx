import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { complaintEnquiry } from "../services/complaintEnquiryService";
import { fetchComplaintFilterData } from "../services/complaintFilterDataService";

// Option constants
const DIVISION_OPTIONS_BY_COMPANY = {
  CGCEL: ["FANS", "SDA", "PUMP", "WHC", "LIGHT"],
  CGPISL: ["CG-FANS", "CG-SDA", "CG-LT", "CG-FHP", "CG-PUMP", "CG-WHC"],
  ALL: [
    "FANS",
    "SDA",
    "PUMP",
    "WHC",
    "LIGHT",
    "CG-FANS",
    "CG-SDA",
    "CG-LT",
    "CG-FHP",
    "CG-PUMP",
    "CG-WHC",
  ],
};
const COMPLAINT_TYPE_OPTIONS = [
  { value: "", label: "ALL" },
  { value: "SALE", label: "SALE" },
  { value: "SERVICE", label: "SERVICE" },
  { value: "INSTALL", label: "INSTALL" },
];
const PRIORITY_OPTIONS = [
  { value: "", label: "ALL" },
  { value: "NORMAL", label: "NORMAL" },
  { value: "HO-ESCALATION", label: "HO-ESCALATION" },
  { value: "CRM-ESCALATION", label: "CRM-ESCALATION" },
  { value: "URGENT", label: "URGENT" },
];
const YES_NO_OPTIONS = [
  { value: "", label: "ALL" },
  { value: "Y", label: "YES" },
  { value: "N", label: "NO" },
];

// Dynamic filter config state
const DEFAULT_FILTER_CONFIG = [
  {
    name: "complaint_type",
    label: "Complaint Type",
    type: "select",
    options: COMPLAINT_TYPE_OPTIONS,
  },
  {
    name: "complaint_priority",
    label: "Complaint Priority",
    type: "select",
    options: PRIORITY_OPTIONS,
  },
  { name: "action_by", label: "Action By", type: "select", options: [] },
  { name: "action_head", label: "Action Head", type: "select", options: [] },
  {
    name: "final_status",
    label: "Final Status",
    type: "select",
    options: YES_NO_OPTIONS,
  },
  {
    name: "spare_pending",
    label: "Spare Pending",
    type: "select",
    options: YES_NO_OPTIONS,
  },
  {
    name: "customer_name",
    label: "Customer Name",
    type: "text",
    placeholder: "Search by Name...",
  },
  {
    name: "customer_contact",
    label: "Customer Contact",
    type: "text",
    placeholder: "Search by Phone Number...",
  },
  {
    name: "complaint_number",
    label: "Complaint Number",
    type: "text",
    placeholder: "Search by Complaint No...",
  },
];

const STATUS_STYLES = {
  FRESH: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-300 text-gray-700",
  NEW: "bg-yellow-100 text-yellow-800",
  OW: "bg-purple-100 text-purple-800",
  RESOLVED: "bg-green-100 text-green-800",
  default: "bg-gray-200 text-gray-900",
};
const buildDivisionOptions = (selectedCompany) => {
  const divisions = DIVISION_OPTIONS_BY_COMPANY[selectedCompany] || [];
  return [
    { value: "", label: "ALL" },
    ...divisions.map((d) => ({ value: d, label: d })),
  ];
};

const InputField = React.memo(({ config, value, onChange, onBlur }) => {
  if (config.type === "select") {
    return (
      <select
        name={config.name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="input-select"
      >
        {config.options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={
              opt.value === ""
                ? { color: "#103d9cff", fontWeight: 600 }
                : { color: "#111827" }
            }
          >
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
  // Only allow digits for customer_contact
  const handleInputChange = (e) => {
    if (config.name === "customer_contact") {
      const digitsOnly = e.target.value.replace(/\D/g, "");
      onChange(config.name, digitsOnly);
    } else {
      onChange(e);
    }
  };
  return (
    <input
      type="text"
      name={config.name}
      placeholder={config.placeholder || ""}
      value={value}
      onChange={handleInputChange}
      onBlur={onBlur}
      className="input-select"
    />
  );
});

import { useLocation, useNavigate } from "react-router-dom";

const ComplaintPendingPage = ({ selectedCompany }) => {
  const divisionOptions = useMemo(
    () => buildDivisionOptions(selectedCompany),
    [selectedCompany],
  );
  const productDivisionConfig = useMemo(
    () => ({
      name: "product_division",
      label: "Product Division",
      type: "select",
      options: divisionOptions,
    }),
    [divisionOptions],
  );
  const location = useLocation();
  const navigate = useNavigate();
  // Parse query params from URL
  const queryParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const obj = {};
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
    return obj;
  }, [location.search]);

  const [filters, setFilters] = useState(() => {
    // If query params exist, use them to set initial filters
    const initial = DEFAULT_FILTER_CONFIG.reduce(
      (acc, cur) => ({ ...acc, [cur.name]: "" }),
      {},
    );
    initial.product_division = "";
    // complaint_priority is always a string now
    return { ...initial, ...queryParams };
  });
  useEffect(() => {
    setFilters((prev) => ({ ...prev, product_division: "" }));
  }, [selectedCompany]);
  const [filterConfig, setFilterConfig] = useState(DEFAULT_FILTER_CONFIG);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 25;
  // Fetch filter options for action_head and action_by
  // Track if filter options are loaded
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
  useEffect(() => {
    let isMounted = true;
    fetchComplaintFilterData()
      .then((filterData) => {
        if (!isMounted) return;
        const actionHeadOptions = [
          { value: "", label: "ALL" },
          ...(Array.isArray(filterData.action_head)
            ? filterData.action_head.map((v) => ({ value: v, label: v }))
            : []),
        ];
        const actionByOptions = [
          { value: "", label: "ALL" },
          ...(Array.isArray(filterData.action_by)
            ? filterData.action_by.map((v) => ({ value: v, label: v }))
            : []),
        ];
        setFilterConfig((prev) =>
          prev.map((f) => {
            if (f.name === "action_head")
              return { ...f, options: actionHeadOptions };
            if (f.name === "action_by")
              return { ...f, options: actionByOptions };
            return f;
          }),
        );
        setFilterOptionsLoaded(true);
      })
      .catch(() => {
        setFilterOptionsLoaded(true); // allow UI to render even if fetch fails
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = useCallback((eOrName, valueOverride) => {
    if (typeof eOrName === "string") {
      // Called as (name, value) for customer_contact
      setFilters((prev) => ({ ...prev, [eOrName]: valueOverride }));
    } else {
      const { name, value } = eOrName.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const fetchData = useCallback(
    async (params, pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const offset = (pageNum - 1) * PAGE_SIZE;
        // Add selectedCompany as complaint_head if present
        const mergedParams = selectedCompany
          ? { ...params, complaint_head: selectedCompany }
          : params;
        const response = await complaintEnquiry(
          mergedParams,
          PAGE_SIZE,
          offset,
        );
        setData(response || []);
        setHasMore((response || []).length === PAGE_SIZE);
      } catch (err) {
        setError("Failed to fetch complaints.");
        setData([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [selectedCompany],
  );

  // Restore saved pending page state (if any) to avoid losing data when navigating back
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingPageState");
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved) {
        if (saved.filters)
          setFilters((prev) => ({ ...prev, ...saved.filters }));
        if (typeof saved.page === "number") setPage(saved.page);
        if (Array.isArray(saved.data)) setData(saved.data);
        if (typeof saved.hasMore === "boolean") setHasMore(saved.hasMore);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const handleSearch = useCallback(
    async (e) => {
      e.preventDefault();
      setPage(1);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== ""),
      );
      // Remove spare_pending_complaints param if present
      const searchParams = new URLSearchParams(params);
      searchParams.delete("spare_pending_complaints");
      searchParams.delete("escalation_complaints");
      searchParams.delete("crm_open_complaints");
      searchParams.delete("high_priority_complaints");
      searchParams.delete("mail_to_be_sent_complaints");
      navigate({ search: searchParams.toString() }, { replace: true });
      // Also remove from params object before fetching data
      delete params.spare_pending_complaints;
      // Save current state so user can return without losing data
      try {
        sessionStorage.setItem(
          "pendingPageState",
          JSON.stringify({ filters, page: 1, data, hasMore }),
        );
      } catch (e) {}
      fetchData(params, 1);
    },
    [filters, fetchData, navigate],
  );
  const handleClear = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTER_CONFIG.reduce(
        (acc, cur) => ({ ...acc, [cur.name]: "" }),
        {},
      ),
      product_division: "",
    });
    setPage(1);
  }, []);

  // Fetch data on page change
  const handlePageChange = (newPage) => {
    try {
      sessionStorage.setItem(
        "pendingPageState",
        JSON.stringify({ filters, page: newPage, data, hasMore }),
      );
    } catch (e) {}
    setPage(newPage);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== ""),
    );
    fetchData(params, newPage);
  };

  // Trigger search on mount if filters are set via URL
  useEffect(
    () => {
      // Only fire if there are query params
      if (Object.keys(queryParams).length > 0) {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== ""),
        );
        fetchData(params, 1);
      }
      // eslint-disable-next-line
    },
    [
      /* only run on mount and when queryParams change */
    ],
  );

  const renderStatus = useCallback((status) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.default;
    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow ${style}`}
      >
        {status}
      </span>
    );
  }, []);

  const tableHeaders = useMemo(
    () => [
      "Complaint",
      "Date",
      "Status",
      "Customer Name",
      "Contact",
      "Current Status",
      "Allocated",
      "Product",
      "Action",
    ],
    [],
  );

  return (
    <div className="md:px-4">
      <div className="w-full">
        <div className="relative z-20 mb-4 mt-3 pl-3 pr-3">
          <form className="space-y-3" onSubmit={handleSearch}>
            {filterOptionsLoaded ? (
              <>
                {/* First row: Division, Complaint Type, Priority, Action By, Action Head */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 md:gap-7 items-end">
                  {[
                    "product_division",
                    "complaint_type",
                    "complaint_priority",
                    "action_by",
                    "action_head",
                  ].map((name) => {
                    const config =
                      name === "product_division"
                        ? productDivisionConfig
                        : filterConfig.find((f) => f.name === name);
                    return (
                      <div key={config.name} className="flex flex-col min-w-0">
                        <span className="text-[0.7rem] font-semibold tracking-wide text-purple-800 mb-0.5 leading-tight uppercase">
                          {config.label}
                        </span>
                        <InputField
                          config={config}
                          value={filters[config.name]}
                          onChange={handleChange}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Second row: Final Status, Spare Pending, Customer Name, Customer Contact, Complaint Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-7 md:gap-7 items-end">
                  {[
                    "spare_pending",
                    "final_status",
                    "customer_name",
                    "customer_contact",
                    "complaint_number",
                  ].map((name) => {
                    const config = filterConfig.find((f) => f.name === name);
                    const isCompact =
                      name === "final_status" || name === "spare_pending";
                    return (
                      <div
                        key={config.name}
                        className={
                          (isCompact
                            ? "flex flex-col w-full min-w-0"
                            : " w-50 flex flex-col min-w-0") +
                          (name === "customer_name" ||
                          name === "complaint_number"
                            ? " relative"
                            : "")
                        }
                      >
                        <span className="text-[0.7rem] font-semibold tracking-wide text-purple-800 mb-0.5 leading-tight uppercase">
                          {config.label}
                        </span>
                        <InputField
                          config={config}
                          value={filters[config.name]}
                          onChange={(eOrName, valueOverride) => {
                            handleChange(eOrName, valueOverride);
                          }}
                        />
                      </div>
                    );
                  })}
                  {/* Search and Clear buttons at the end of the second row */}
                  <div className="flex items-end h-full justify-end mt-0 gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-1 px-3 rounded-full shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:opacity-60 text-xs"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                        />
                      </svg>
                      {loading ? "Searching..." : "Search"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-full shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-xs"
                      onClick={handleClear}
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Clear
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-black-400 text-xs py-2">
                Loading filter data...
              </div>
            )}
          </form>
          {error && (
            <div className="text-red-500 mt-2 font-semibold">{error}</div>
          )}
        </div>
        <div className="bg-white/90 rounded-3xl shadow-2xl overflow-x-auto border border-purple-100 backdrop-blur-sm">
          <div
            className="max-h-[70vh] overflow-y-auto scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`
              .scrollbar-none::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <table className="min-w-full divide-y divide-purple-200">
              <thead className="sticky top-0 z-10">
                <tr>
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-center text-xs font-extrabold text-white uppercase tracking-wider drop-shadow sticky top-0 z-10 bg-purple-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-purple/80 divide-y divide-purple-50">
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr
                      key={row.complaint_number || idx}
                      className="hover:bg-purple-50/60 transition-all duration-200 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        try {
                          sessionStorage.setItem(
                            "pendingPageState",
                            JSON.stringify({ filters, page, data, hasMore }),
                          );
                        } catch (e) {}
                        navigate("/UpdateComplaint", {
                          state: {
                            complaint_number: row.complaint_number || "",
                          },
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          try {
                            sessionStorage.setItem(
                              "pendingPageState",
                              JSON.stringify({ filters, page, data, hasMore }),
                            );
                          } catch (e) {}
                          navigate("/UpdateComplaint", {
                            state: {
                              complaint_number: row.complaint_number || "",
                            },
                          });
                        }
                      }}
                    >
                      <td className="px-2 py-2 break-words text-sm font-bold text-purple-700 drop-shadow text-center">
                        {row.complaint_number}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                        <div>{row.complaint_date}</div>
                        {row.complaint_time && (
                          <div className="text-[11px] text-gray-600 mt-1">
                            {row.complaint_time}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 break-words text-sm text-center">
                        {renderStatus(row.complaint_status)}
                      </td>
                      <td className="px-2 py-2 break-words text-sm text-gray-800 font-medium text-center">
                        {row.customer_name}
                      </td>
                      <td className="px-2 py-2 break-words text-sm text-center">
                        {row.customer_contact1 && (
                          <div>{row.customer_contact1}</div>
                        )}
                        {row.customer_contact2 && (
                          <div className="mt-1">{row.customer_contact2}</div>
                        )}
                      </td>
                      <td className="px-2 py-2 break-words text-sm text-center">
                        {row.current_status}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-center">
                        {row.action_by}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-orange-700 text-center">
                        {row.product_division && (
                          <div>{row.product_division}</div>
                        )}
                        {row.product_model && (
                          <div className="text-[11px] text-gray-700 mt-1">
                            {row.product_model}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 break-words text-sm text-center">
                        {row.action_head}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={tableHeaders.length}
                      className="px-6 py-8 text-center text-purple-300 text-xl font-semibold italic"
                    >
                      {loading ? "Loading..." : ""}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination Controls: Show only if more than 1 page */}
            {(page > 1 || hasMore) && (
              <div className="flex justify-center items-center gap-2 py-1 text-xs bg-gray-50 border-t border-purple-100 rounded-b-2xl mt-0">
                <button
                  className="px-3 py-1 rounded-full border border-purple-300 bg-white text-purple-700 font-semibold shadow-sm hover:bg-purple-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  tabIndex={-1}
                >
                  &#8592; Prev
                </button>
                <span className="mx-2 font-semibold">Page {page}</span>
                <button
                  className="px-3 py-1 rounded-full border border-purple-300 bg-white text-purple-700 font-semibold shadow-sm hover:bg-purple-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasMore || loading}
                  tabIndex={-1}
                >
                  Next &#8594;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Tailwind custom input-select style */}
      <style>{`
        .input-select {
          width: 100%;
          border-radius: 0.35rem;
          border: 1px solid #c7d2fe;
          background: #f8fafc;
          padding: 0.15rem 0.45rem;
          font-size: 0.9rem;
          color: #504b50ff;
          font-weight: 500;
          box-shadow: 0 1px 2px 0 #6366f11a;
          transition: box-shadow 0.2s, border-color 0.2s;
          min-height: 1.7rem;
        }
        .input-select:focus {
          outline: none;
          border-color: #ffabe6ff;
          box-shadow: 0 0 0 2px #f095e155;
        }
        .input-select::placeholder {
          font-size: 0.9rem;
        }
        .block.text-xs.font-semibold.text-gray-600.mb-1 {
          font-size: 0.7rem;
          margin-bottom: 0.08rem;
        }
      `}</style>
    </div>
  );
};

export default ComplaintPendingPage;
