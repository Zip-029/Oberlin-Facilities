import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useWorkOrders } from "@/context/WorkOrderContext";
import { Separator } from "@/components/ui/separator";

function SiteHeader() {
  const location = useLocation();
  if (location.pathname === "/upload") return null;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4"
        />
        <h1 className="text-base font-medium">Work Order Analytics</h1>
      </div>
    </header>
  );
}

function ShellContent() {
  const { isLoaded } = useWorkOrders();
  const { setOpen } = useSidebar();
  const hasCollapsed = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // When data loads, navigate to dashboard
  useEffect(() => {
    if (isLoaded && location.pathname !== "/dashboard") {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, location.pathname, navigate]);

  // Auto-collapse sidebar when arriving at /dashboard with data
  useEffect(() => {
    if (isLoaded && location.pathname === "/dashboard" && !hasCollapsed.current) {
      hasCollapsed.current = true;
      const timer = setTimeout(() => setOpen(false), 300);
      return () => clearTimeout(timer);
    }
    if (!isLoaded) {
      hasCollapsed.current = false;
    }
  }, [isLoaded, location.pathname, setOpen]);

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </>
  );
}

export default function DashboardShell() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <ShellContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
