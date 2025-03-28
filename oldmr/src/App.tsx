import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import WorkOrders from "./pages/WorkOrders";
import Dashboard from "./pages/Dashboard";
import Payroll from "./pages/Payroll";
import VehicleMaintenance from "./pages/VehicleMaintenance";
import Storage from "./pages/Storage";
import Receipts from "./pages/Receipts";
import Integrations from "./pages/Integrations";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import BulkOrdersTest from "./pages/BulkOrdersTest";
import MaterialsRequirement from "./pages/MaterialsRequirement";

const queryClient = new QueryClient();

function App() {
  return (
    <main className="app">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/landing" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/bulk-orders-test" element={<BulkOrdersTest />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/work-orders"
                  element={
                    <ProtectedRoute>
                      <WorkOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payroll"
                  element={
                    <ProtectedRoute>
                      <Payroll />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicle-maintenance"
                  element={
                    <ProtectedRoute>
                      <VehicleMaintenance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/storage"
                  element={
                    <ProtectedRoute>
                      <Storage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute>
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/supervisor"
                  element={<Navigate to="/attendance" replace />}
                />
                <Route
                  path="/admin"
                  element={<Navigate to="/employees" replace />}
                />
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance-history"
                  element={
                    <ProtectedRoute>
                      <AttendanceHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receipts"
                  element={
                    <ProtectedRoute>
                      <Receipts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute>
                      <Integrations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/materials"
                  element={
                    <ProtectedRoute>
                      <MaterialsRequirement />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </main>
  );
}

export default App;
