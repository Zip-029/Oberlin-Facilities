import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { filterByDateRange, getTechnicianWorkload } from '@/lib/analytics';
import { ArrowUpDown, User2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

type TechnicianData = {
  technician: string;
  assigned: number;
  open: number;
  completed: number;
  avgDays: number;
};

export const technicianColumns: ColumnDef<TechnicianData>[] = [
  {
    accessorKey: 'technician',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Technician
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue('technician') as string;
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px] bg-primary/5 text-primary border">
              {initials || <User2 className="size-3" />}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm leading-none">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'assigned',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Assigned
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant="outline" className="font-mono bg-muted/30">
          {(row.getValue('assigned') as number).toLocaleString()}
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
    cell: ({ row }) => <div className="text-right tabular-nums font-medium">{(row.getValue('open') as number).toLocaleString()}</div>,
  },
  {
    accessorKey: 'completed',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Completed
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right tabular-nums text-muted-foreground">{(row.getValue('completed') as number).toLocaleString()}</div>,
  },
  {
    accessorKey: 'avgDays',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-mr-3 ml-auto h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Avg Days
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue('avgDays') as number;
      if (val <= 0) return <div className="text-right text-muted-foreground">−</div>;
      
      const isHigh = val > 14;
      return (
        <div className="flex items-center justify-end gap-1.5 tabular-nums">
          <span className={isHigh ? 'text-destructive font-medium' : 'text-foreground'}>
            {val.toFixed(1)}
          </span>
          <Clock className={`size-3 ${isHigh ? 'text-destructive' : 'text-muted-foreground'}`} />
        </div>
      );
    },
  },
];

export function TechnicianTable() {
  const { workOrders, dateRange } = useWorkOrders();

  const data = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    return getTechnicianWorkload(filtered);
  }, [workOrders, dateRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Workload</CardTitle>
        <CardDescription>Performance metrics by technician/group</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={technicianColumns}
          data={data}
          initialSorting={[{ id: 'assigned', desc: true }]}
        />
      </CardContent>
    </Card>
  );
}
