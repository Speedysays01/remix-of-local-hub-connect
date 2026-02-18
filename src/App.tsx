import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute, ROLE_DASHBOARDS } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import UserDashboard from "@/pages/dashboards/UserDashboard";
import VendorDashboard from "@/pages/dashboards/VendorDashboard";
import DeliveryDashboard from "@/pages/dashboards/DeliveryDashboard";
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Root redirect based on role
const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_DASHBOARDS[role!] || "/dashboard"} replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

    {/* Root */}
    <Route path="/" element={<RootRedirect />} />

    {/* User routes */}
    <Route
      path="/dashboard/*"
      element={
        <ProtectedRoute allowedRoles={["user"]}>
          <UserDashboard />
        </ProtectedRoute>
      }
    />

    {/* Vendor routes */}
    <Route
      path="/vendor/*"
      element={
        <ProtectedRoute allowedRoles={["vendor"]}>
          <VendorDashboard />
        </ProtectedRoute>
      }
    />

    {/* Delivery routes */}
    <Route
      path="/delivery/*"
      element={
        <ProtectedRoute allowedRoles={["delivery"]}>
          <DeliveryDashboard />
        </ProtectedRoute>
      }
    />

    {/* Admin routes */}
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
