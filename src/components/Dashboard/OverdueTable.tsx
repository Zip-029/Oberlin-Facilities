import { useMemo } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { filterByDateRange, getOverdueTickets } from '@/lib/analytics';
import { CheckCircle2, ArrowUpDown, AlertTriangle, Hash } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';

type OverdueData = {
  id: string;
  building: string;
  category: string;
  technician: string;
  callDate: Date;
  targetDate: Date;
  daysOverdue: number;
};

export const overdueColumns: ColumnDef<OverdueData>[] = [
  {
    accessorKey: 'id',
    header: 'WO Number',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Hash className="size-3 text-muted-foreground" />
        <span className="font-semibold tabular-nums">{row.getValue('id')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'building',
    header: 'Building',
    cell: ({ row }) => <span className="font-medium">{row.getValue('building')}</span>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-muted/30 font-normal">
        {row.getValue('category')}
      </Badge>
    ),
  },
  {
    accessorKey: 'technician',
    header: 'Technician',
  },
  {
    accessorKey: 'callDate',
    header: 'Call Date',
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums text-xs">{format(row.getValue('callDate'), 'MMM d, yyyy')}</span>,
  },
  {
    accessorKey: 'targetDate',
    header: 'Target Date',
    cell: ({ row }) => <span className="text-muted-foreground tabular-nums text-xs font-medium">{format(row.getValue('targetDate'), 'MMM d, yyyy')}</span>,
  },
  {
    accessorKey: 'daysOverdue',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Days Overdue
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue('daysOverdue') as number;
      const isUrgent = val > 30;
      return (
        <div className="flex items-center justify-end gap-2">
          {isUrgent && <AlertTriangle className="size-3 text-destructive animate-pulse" />}
          <Badge variant={isUrgent ? "destructive" : "secondary"} className="font-mono">
            {val.toLocaleString()}d
          </Badge>
        </div>
      );
    },
  },
];

export function OverdueTable() {
  const { workOrders, dateRange } = useWorkOrders();
  const [search, setSearch] = React.useState('');

  const data = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    return getOverdueTickets(filtered);
  }, [workOrders, dateRange]);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(d =>
      d.id.toLowerCase().includes(q) ||
      d.building.toLowerCase().includes(q) ||
      d.technician.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Overdue Work Orders</CardTitle>
          <CardDescription>Open tickets that have passed their target due date</CardDescription>
        </div>
        {data.length > 0 && (
          <CardAction>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-[200px]"
            />
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="mb-3 size-12 text-primary" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              There are no overdue tickets in this date range.
            </p>
          </div>
        ) : (
          <DataTable
            columns={overdueColumns}
            data={filteredData}
            initialSorting={[{ id: 'daysOverdue', desc: true }]}
            pageSize={15}
          />
        )}
      </CardContent>
    </Card>
  );
}
