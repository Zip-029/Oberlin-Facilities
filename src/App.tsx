import { Routes, Route, Navigate } from "react-router";
import { WorkOrderProvider } from "@/context/WorkOrderContext";
import DashboardShell from "./components/Dashboard/Dashboard";
import { AnalyticsDashboard } from "./components/Dashboard/AnalyticsDashboard";
import { UploadZone } from "./components/Dashboard/UploadZone";
import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";

export function App() {
  const { theme } = useTheme();

  return (
    <WorkOrderProvider>
      <Toaster theme={theme as "light" | "dark" | "system"} />
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route element={<DashboardShell />}>
          <Route path="/upload" element={<UploadZone />} />
          <Route path="/dashboard" element={<AnalyticsDashboard />} />
        </Route>
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </WorkOrderProvider>
  );
}

export default App;