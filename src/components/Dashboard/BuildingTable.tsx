import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { filterByDateRange, getTopBuildings } from '@/lib/analytics';
import { ArrowUpDown, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

type BuildingData = {
  name: string;
  total: number;
  open: number;
  overdue: number;
};

export const buildingColumns: ColumnDef<BuildingData>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Building
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">

        <div className="flex flex-col">
          <span className="font-medium text-sm leading-none mb-1">
            {row.getValue('name')}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">

            Main Campus
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Total
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant="secondary" className="font-mono">
          {(row.getValue('total') as number).toLocaleString()}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'open',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Open
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {(row.getValue('open') as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'overdue',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Overdue
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue('overdue') as number;
      return (
        <div className="text-right">
          {val > 0 ? (
            <Badge variant="destructive" className="font-mono">
              {val.toLocaleString()}
            </Badge>
          ) : (
            <span className="text-muted-foreground tabular-nums">0</span>
          )}
        </div>
      );
    },
  },
];

export function BuildingTable() {
  const { workOrders, dateRange } = useWorkOrders();

  const data = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    return getTopBuildings(filtered);
  }, [workOrders, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Buildings</CardTitle>
        <CardDescription>Volume and status by location</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={buildingColumns}
          data={data}
          initialSorting={[{ id: 'total', desc: true }]}
        />
      </CardContent>
    </Card>
  );
}
