import DeleteEmployeePage from "./pages/EmployeeDeletePage.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MenuDashboardPage from "./pages/MenuDashboardPage.jsx";
import PageNotFound from "./pages/PageNotFound";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DashboardDataProvider } from "./context/DashboardDataContext.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import CreateEmployeePage from "./pages/EmployeeCreatePage.jsx";
import ShowStandardEmployeesPage from "./pages/EmployeeShowStandardPage.jsx";
import ShowAllEmployeesPage from "./pages/EmployeeShowAllPage.jsx";
import NotificationCreatePage from "./pages/NotificationCreatePage.jsx";
import StockCGCELUploadPage from "./pages/StockCGCELUploadPage.jsx";
import React, { useState } from "react";
import StockCGPISLUploadPage from "./pages/StockCGPISLUploadPage.jsx";
import StockCGCELEnquiryPage from "./pages/StockCGCELEnquiryPage.jsx";
import StockCGPISLEnquiryPage from "./pages/StockCGPISLEnquiryPage.jsx";
import GRCCGCELUploadPage from "./pages/GRCCGCELUploadPage.jsx";
import GRCCGPISLUploadPage from "./pages/GRCCGPISLUploadPage.jsx";
import StockCGCELUpdatePage from "./pages/StockCGCELUpdatePage.jsx";
import StockCGCELRaiseIndentPage from "./pages/StockCGCELRaiseIndentPage.jsx";
import StockCGPISLRaiseIndentPage from "./pages/StockCGPISLRaiseIndentPage.jsx";
import StockCGCELGenerateIndentPage from "./pages/StockCGCELGenerateIndentPage.jsx";
import StockCGCELIndentEnquiryPage from "./pages/StockCGCELIndentEnquiryPage.jsx";
import StockCGPISLGenerateIndentPage from "./pages/StockCGPISLGenerateIndentPage.jsx";
import StockCGPISLIndentEnquiryPage from "./pages/StockCGPISLIndentEnquiryPage.jsx";
import GRCCGCELReceiveSparePage from "./pages/GRCCGCELReceiveSparePage.jsx";
import GRCCGCELReturnSparePage from "./pages/GRCCGCELReturnSparePage.jsx";

function AppRoutesWithNav({ selectedCompany, setSelectedCompany }) {
  return (
    <>
      <Header selectedCompany={selectedCompany} />
      <div className="pt-[5.5rem] pb-[1.5rem] min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <PageNotFound />
              </PrivateRoute>
            }
          />
          <Route
            path="/MenuDashboard"
            element={
              <PrivateRoute>
                <MenuDashboardPage
                  selectedCompany={selectedCompany}
                  setSelectedCompany={setSelectedCompany}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateEmployee"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <CreateEmployeePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/DeleteEmployee"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <DeleteEmployeePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ChangePassword"
            element={
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ShowAllEmployees"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShowAllEmployeesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ShowStandardEmployees"
            element={
              <PrivateRoute>
                <ShowStandardEmployeesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateNotification"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <NotificationCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UploadCGCELStockRecords"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <StockCGCELUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UploadCGPISLStockRecords"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <StockCGPISLUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ViewCGCELStockRecords"
            element={
              <PrivateRoute>
                <StockCGCELEnquiryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ViewCGPISLStockRecords"
            element={
              <PrivateRoute>
                <StockCGPISLEnquiryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UploadCGCELGRCRecords"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <GRCCGCELUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UploadCGPISLGRCRecords"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <GRCCGPISLUploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/RaiseCGCELSpareIndent"
            element={
              <PrivateRoute>
                <StockCGCELRaiseIndentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/RaiseCGPISLSpareIndent"
            element={
              <PrivateRoute>
                <StockCGPISLRaiseIndentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/UpdateCGCELStock"
            element={
              <PrivateRoute>
                <StockCGCELUpdatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/GenerateCGCELSpareIndent"
            element={
              <PrivateRoute>
                <StockCGCELGenerateIndentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/IndentDetailsCGCEL"
            element={
              <PrivateRoute>
                <StockCGCELIndentEnquiryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/GenerateCGPISLSpareIndent"
            element={
              <PrivateRoute>
                <StockCGPISLGenerateIndentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/IndentDetailsCGPISL"
            element={
              <PrivateRoute>
                <StockCGPISLIndentEnquiryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ReceiveCGCELGRCRecords"
            element={
              <PrivateRoute>
                <GRCCGCELReceiveSparePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/GRCCGCELSpareReturn"
            element={
              <PrivateRoute>
                <GRCCGCELReturnSparePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

function App() {
  const [selectedCompany, setSelectedCompany] = useState("ALL");
  return (
    <BrowserRouter>
      <DashboardDataProvider>
        <AuthProvider>
          <AppRoutesWithNav
            selectedCompany={selectedCompany}
            setSelectedCompany={setSelectedCompany}
          />
        </AuthProvider>
      </DashboardDataProvider>
    </BrowserRouter>
  );
}

export default App;
