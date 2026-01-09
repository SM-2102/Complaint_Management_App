// Centralized menu and card actions config for NavBar and MenuDashboardPage
import { FaFileAlt, FaBoxes, FaExclamationTriangle } from "react-icons/fa";

export const menuConfig = [
  {
    key: "complaint",
    title: "Complaint Addressal",
    icon: FaExclamationTriangle,
    bgColor: "#ffe4ec",
    actions: [
      {
        label: "Complaint Enquiry",
        path: "/ComplaintEnquiry",
        company: "ALL",
      },
      { label: "Add New Complaint", path: "/CreateComplaint", company: "ALL" },
      { label: "Update Complaint", path: "/UpdateComplaint", company: "ALL" },
      { label: "Report Generation", path: "/ReportGeneration", company: "ALL" },
      { label: "Complaint Reallocation", path: "/ComplaintReallocation", company: "ALL" },
      { label: "Upload Complaints", path: "/UploadComplaints", company: "ALL" },
      {
        label: "Create RFR Record",
        path: "/CreateRFRRecord",
        company: "CGCEL",
      },
      {
        label: "Generate RFR Record",
        path: "/GenerateRFRRecord",
        company: "CGCEL",
      },
    ],
  },
  {
    key: "stock",
    title: "Stock Maintenance",
    icon: FaBoxes,
    bgColor: "#f0f4f8",
    actions: [
      {
        label: "Upload Stock Records",
        path: "/UploadCGCELStockRecords",
        company: "CGCEL",
      },
      {
        label: "Upload Stock Records",
        path: "/UploadCGPISLStockRecords",
        company: "CGPISL",
      },
      {
        label: "Stock Records Enquiry",
        path: "/ViewCGCELStockRecords",
        company: "CGCEL",
      },
      {
        label: "Stock Records Enquiry",
        path: "/ViewCGPISLStockRecords",
        company: "CGPISL",
      },
      {
        label: "Raise Spare Indent",
        path: "/RaiseCGCELSpareIndent",
        company: "CGCEL",
      },
      {
        label: "Raise Spare Indent",
        path: "/RaiseCGPISLSpareIndent",
        company: "CGPISL",
      },
      {
        label: "Generate Spare Indent",
        path: "/GenerateCGCELSpareIndent",
        company: "CGCEL",
      },
      {
        label: "Generate Spare Indent",
        path: "/GenerateCGPISLSpareIndent",
        company: "CGPISL",
      },
      {
        label: "Spare Indent Enquiry",
        path: "/IndentDetailsCGCEL",
        company: "CGCEL",
      },
      {
        label: "Spare Indent Enquiry",
        path: "/IndentDetailsCGPISL",
        company: "CGPISL",
      },
      {
        label: "Update ASC Stock",
        path: "/UpdateCGCELStock",
        company: "CGCEL",
      },
      {
        label: "Create Invoice Record",
        path: "/AddCGCELInvoiceRecord",
        company: "CGCEL",
      },
      {
        label: "Create Invoice Record",
        path: "/AddCGPISLInvoiceRecord",
        company: "CGPISL",
      },
      {
        label: "Print Invoice Record",
        path: "/PrintCGCELInvoiceRecord",
        company: "CGCEL",
      },
      {
        label: "Print Invoice Record",
        path: "/PrintCGPISLInvoiceRecord",
        company: "CGPISL",
      },
    ],
  },
  {
    key: "grc",
    title: "Goods Returnable Challan",
    icon: FaFileAlt,
    bgColor: "#e7d7f8ff",
    actions: [
      {
        label: "CGCEL Upload GRC",
        path: "/UploadCGCELGRCRecords",
        company: "CGCEL",
      },
      {
        label: "Upload GRC Records",
        path: "/UploadCGPISLGRCRecords",
        company: "CGPISL",
      },
      {
        label: "CGCEL Receive GRC",
        path: "/ReceiveCGCELGRCRecords",
        company: "CGCEL",
      },
      {
        label: "Receive GRC Records",
        path: "/ReceiveCGPISLGRCRecords",
        company: "CGPISL",
      },
      {
        label: "CGCEL Spare Return",
        path: "/GRCCGCELSpareReturn",
        company: "CGCEL",
      },
      {
        label: "Spare Return",
        path: "/GRCCGPISLSpareReturn",
        company: "CGPISL",
      },
      {
        label: "CGCEL GRC Enquiry",
        path: "/GRCCGCELEnquiry",
        company: "CGCEL",
      },
      { label: "GRC Enquiry", path: "/GRCCGPISLEnquiry", company: "CGPISL" },
    ],
  },
];
