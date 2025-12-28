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
      { label: "Upload Complaints", path: "/UploadComplaints", company: "ALL" },
      {
        label: "Create RFR Record",
        path: "/CreateRFRRecord",
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
        label: "Upload CGCEL Stock",
        path: "/UploadCGCELStockRecords",
        company: "CGCEL",
      },
      {
        label: "Upload Stock Records",
        path: "/UploadCGPISLStockRecords",
        company: "CGPISL",
      },
      {
        label: "View CGCEL Stock",
        path: "/ViewCGCELStockRecords",
        company: "CGCEL",
      },
      {
        label: "View Stock Records",
        path: "/ViewCGPISLStockRecords",
        company: "CGPISL",
      },
      {
        label: "CGCEL Spare Indent",
        path: "/RaiseCGCELSpareIndent",
        company: "CGCEL",
      },
      {
        label: "Raise Spare Indent",
        path: "/RaiseCGPISLSpareIndent",
        company: "CGPISL",
      },
      {
        label: "CGCEL Generate Indent",
        path: "/GenerateCGCELSpareIndent",
        company: "CGCEL",
      },
      {
        label: "Generate Spare Indent",
        path: "/GenerateCGPISLSpareIndent",
        company: "CGPISL",
      },
      {
        label: "CGCEL Indent Details",
        path: "/IndentDetailsCGCEL",
        company: "CGCEL",
      },
      {
        label: "Indent Details",
        path: "/IndentDetailsCGPISL",
        company: "CGPISL",
      },
      {
        label: "Update CGCEL Stock",
        path: "/UpdateCGCELStock",
        company: "CGCEL",
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
        label: "Upload CGCEL GRC",
        path: "/UploadCGCELGRCRecords",
        company: "CGCEL",
      },
      {
        label: "Upload GRC Records",
        path: "/UploadCGPISLGRCRecords",
        company: "CGPISL",
      },
      {
        label: "View CGCEL GRC",
        path: "/ViewCGCELGRCRecords",
        company: "CGCEL",
      },
      {
        label: "View GRC Records",
        path: "/ViewCGPISLGRCRecords",
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
        label: "GRC CGCEL Enquiry",
        path: "/GRCCGCELEnquiry",
        company: "CGCEL",
      },
      { label: "GRC Enquiry", path: "/GRCCGPISLEnquiry", company: "CGPISL" },
    ],
  },
];
