import { createContext, useContext, useState, type ReactNode, useCallback, useMemo } from 'react';
import type { WorkOrder } from '../types/work-order';
import { parseWorkOrderFiles } from '../lib/parse-workorders';
import { startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

interface WorkOrderContextType {
  workOrders: WorkOrder[];
  isLoaded: boolean;
  dateRange: { from: Date; to: Date } | undefined;
  setDateRange: (range: { from: Date; to: Date } | undefined) => void;
  loadFiles: (files: File[]) => Promise<void>;
  clearData: () => void;
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

export function WorkOrderProvider({ children }: { children: ReactNode }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);

  const loadFiles = useCallback(async (files: File[]) => {
    try {
      const parsedOrders = await parseWorkOrderFiles(files);
      if (parsedOrders.length === 0) {
        toast.error("No work orders found in the selected files.");
        return;
      }
      setWorkOrders(parsedOrders);
      setIsLoaded(true);

      // Extract min and max call dates
      const validDates = parsedOrders.map(wo => wo.callDate.getTime()).filter(t => !isNaN(t));
      if (validDates.length > 0) {
        const minDate = new Date(Math.min(...validDates));
        const maxDate = new Date(Math.max(...validDates));
        setDateRange({ from: startOfDay(minDate), to: endOfDay(maxDate) });
      }
      
      toast.success(`Successfully loaded ${parsedOrders.length} work orders from ${files.length} file(s).`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to parse files. Please ensure they are valid TopDesk exports.");
    }
  }, []);

  const clearData = useCallback(() => {
    setWorkOrders([]);
    setIsLoaded(false);
    setDateRange(undefined);
  }, []);

  const value = useMemo(() => ({
    workOrders,
    isLoaded,
    dateRange,
    setDateRange,
    loadFiles,
    clearData
  }), [workOrders, isLoaded, dateRange, loadFiles, clearData]);

  return <WorkOrderContext.Provider value={value}>{children}</WorkOrderContext.Provider>;
}

export function useWorkOrders() {
  const context = useContext(WorkOrderContext);
  if (context === undefined) {
    throw new Error('useWorkOrders must be used within a WorkOrderProvider');
  }
  return context;
}
