import { DateRangeFilter } from './DateRangeFilter';
import { SummaryCards } from './SummaryCards';
import { StatusChart } from './StatusChart';
import { TrendChart } from './TrendChart';
import { CategoryChart } from './CategoryChart';
import { BuildingTable } from './BuildingTable';
import { TechnicianTable } from './TechnicianTable';
import { OverdueTable } from './OverdueTable';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router';

export function AnalyticsDashboard() {
  const { clearData, workOrders } = useWorkOrders();
  const navigate = useNavigate();

  const handleUploadNew = () => {
    clearData();
    navigate('/upload');
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header row */}
        <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Analyzing {workOrders.length.toLocaleString()} work orders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeFilter />
            <Button variant="outline" size="sm" onClick={handleUploadNew}>
              <RefreshCcw className="mr-2 size-4" />
              Upload New Data
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <SummaryCards />

        {/* Row 2: Status (1 col) + Trend (2 cols) */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6 items-stretch">
          <div className="lg:col-span-1 h-full">
            <StatusChart />
          </div>
          <div className="lg:col-span-2 h-full">
            <TrendChart />
          </div>
        </div>

        {/* Row 3: Category chart — full width */}
        <div className="px-4 lg:px-6">
          <CategoryChart />
        </div>

        {/* Tables row */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
          <BuildingTable />
          <TechnicianTable />
        </div>

        {/* Overdue table — full width */}
        <div className="px-4 lg:px-6">
          <OverdueTable />
        </div>
      </div>
    </div>
  );
}
