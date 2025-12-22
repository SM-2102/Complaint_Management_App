import DeleteUserPage from "./pages/UserDeletePage.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MenuDashboardPage from "./pages/MenuDashboardPage.jsx";
import PageNotFound from "./pages/PageNotFound";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DashboardDataProvider } from "./context/DashboardDataContext.jsx";
import ChangePasswordPage from "./pages/UserChangePasswordPage.jsx";
import CreateUserPage from "./pages/UserCreatePage.jsx";
import ShowStandardUsersPage from "./pages/UserShowStandardPage.jsx";
import ShowAllUsersPage from "./pages/UserShowAllPage.jsx";

function AppRoutesWithNav() {
  return (
    <>
      <Header />
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
                <MenuDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/CreateUser"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <CreateUserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/DeleteUser"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <DeleteUserPage />
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
            path="/ShowAllUsers"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ShowAllUsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ShowStandardUsers"
            element={
              <PrivateRoute>
                <ShowStandardUsersPage />
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
  return (
    <BrowserRouter>
      <DashboardDataProvider>
        <AuthProvider>
          <AppRoutesWithNav />
        </AuthProvider>
      </DashboardDataProvider>
    </BrowserRouter>
  );
}

export default App;
