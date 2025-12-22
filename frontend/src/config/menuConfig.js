// Centralized menu and card actions config for NavBar and MenuDashboardPage
import {
  FaUser,
  FaTools,
  FaShoppingBag,
  FaStore,
  FaReceipt,
} from "react-icons/fa";
import { MdOutlineBuild } from "react-icons/md";

export const menuConfig = [
  {
    key: "customer",
    title: "Master Entry",
    icon: FaUser,
    bgColor: "#ffe4ec",
    actions: [
      { label: "Add Master Record", path: "/CreateCustomerRecord" },
      { label: "Update Master Record", path: "/UpdateCustomerRecord" },
      { label: "Add ASC Name", path: "/CreateASCName" },
      { label: "Add Model Record", path: "/CreateModel" },
      { label: "Upload Complaints", path: "/UploadComplaintNumber" },
      { label: "Upload CG SRF", path: "/UploadCGSRFNumber" },
    ],
  },
  {
    key: "warranty",
    title: "Warranty Replacement / Repair",
    icon: FaTools,
    bgColor: "#fff7e6",
    actions: [
      { label: "Create SRF Record", path: "/CreateWarrantySRF" },
      { label: "Update SRF Record", path: "/UpdateWarrantySRF" },
      { label: "Print SRF Record", path: "/PrintWarrantySRF" },
      { label: "Settle SRF Record", path: "/ProposeToSettleWarrantySRF" },
      { label: "Settle Final SRF", path: "/FinalSettlementWarrantySRF" },
      { label: "Enquiry", path: "/WarrantyEnquiry", showInDashboard: false },
    ],
  },
  {
    key: "out_of_warranty",
    title: "Out of Warranty Repair",
    icon: MdOutlineBuild,
    bgColor: "#e6fff7",
    actions: [
      { label: "Create SRF Record", path: "/CreateOutOfWarrantySRF" },
      { label: "Update SRF Record", path: "/UpdateOutOfWarrantySRF" },
      { label: "Print SRF Record", path: "/PrintOutOfWarrantySRF" },
      { label: "Settle SRF Record", path: "/ProposeToSettleOutOfWarrantySRF" },
      { label: "Settle Final SRF", path: "/FinalSettlementOutOfWarrantySRF" },
      {
        label: "Enquiry",
        path: "/OutOfWarrantyEnquiry",
        showInDashboard: false,
      },
    ],
  },
  {
    key: "vendor",
    title: "Vendor Activity",
    icon: FaShoppingBag,
    bgColor: "#f0f4f8",
    actions: [
      {
        label: "Create Vendor Challan",
        path: "/CreateVendorChallan",
      },
      {
        label: "Print Vendor Challan",
        path: "/PrintVendorChallan",
      },
      {
        label: "Settle Vendor Record",
        path: "/ProposeToSettleVendor",
      },
      {
        label: "Settle Final Vendor",
        path: "/FinalSettlementVendor",
      },
    ],
  },
  {
    key: "challan",
    title: "Road Challan",
    icon: FaReceipt,
    bgColor: "#faf6c0ff",
    actions: [
      {
        label: "Create Unique Challan",
        path: "/CreateUniqueServicesRoadChallan",
      },
      {
        label: "Create Smart Challan",
        path: "/CreateSmartEnterpriseRoadChallan",
      },
      {
        label: "Print Unique Challan",
        path: "/PrintUniqueServicesRoadChallan",
      },
      {
        label: "Print Smart Challan",
        path: "/PrintSmartEnterpriseRoadChallan",
      },
    ],
  },
  {
    key: "retail",
    title: "Retail Sales / Services",
    icon: FaStore,
    bgColor: "#e7d7f8ff",
    actions: [
      { label: "Add Record", path: "/CreateRetailRecord" },
      { label: "Update Record", path: "/UpdateRetailRecord" },
      { label: "Print Receipt", path: "/PrintRetailReceipt" },
      { label: "Settle Record", path: "/ProposeToSettleRetailRecord" },
      { label: "Final Settlement", path: "/FinalSettlementRetailRecord" },
      {
        label: "Enquiry",
        path: "/RetailRecordEnquiry",
        showInDashboard: false,
      },
    ],
  },
];
