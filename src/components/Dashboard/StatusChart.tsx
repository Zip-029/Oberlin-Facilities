import { useMemo } from 'react';
import {
  Pie,
  PieChart,
  Cell,
  Label,
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { filterByDateRange, isOpenStatus } from '@/lib/analytics';

export function StatusChart() {
  const { workOrders, dateRange } = useWorkOrders();

  const { openCount, openBreakdown } = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    const openWOs = filtered.filter(wo => isOpenStatus(wo.status));
    const open = openWOs.length;

    // Sub-status breakdown for open WOs only
    const statusCounts: Record<string, number> = {};
    openWOs.forEach(wo => {
      const s = wo.status.trim();
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const breakdown = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      openCount: open,
      openBreakdown: breakdown,
    };
  }, [workOrders, dateRange]);

  // Donut chart config for open WO sub-statuses
  const statusColors: Record<string, string> = {
    'New': '#3b82f6', // blue-500
    'In progress': '#f59e0b', // amber-500
    'Updated by user': '#f97316', // orange-500
    'Waiting for Vendor': '#64748b', // slate-500
    'Waiting for user': '#14b8a6', // teal-500
    'Logged': '#a855f7', // purple-500
  };

  const donutConfig: ChartConfig = {};
  openBreakdown.forEach(item => {
    donutConfig[item.name] = {
      label: item.name,
      color: statusColors[item.name] || '#3b82f6',
    };
  });

  const donutData = openBreakdown.map(item => ({
    ...item,
    fill: statusColors[item.name] || '#3b82f6',
  }));

  if (openCount === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Open Work Orders by Status</CardTitle>
          <CardDescription>All work orders complete</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-12">
          <CheckCircle2 className="mb-3 size-12 text-primary" />
          <p className="text-lg font-medium">All work orders complete</p>
          <p className="text-sm text-muted-foreground">
            No open tickets in this date range.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Open Work Orders by Status</CardTitle>
        <CardDescription>
          Breakdown of {openCount.toLocaleString()} open tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 pb-4 px-2">
        <ChartContainer config={donutConfig} className="mx-auto aspect-[1.2] w-full max-w-[200px] min-h-[160px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {donutData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} stroke="none" />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="central">
                        <tspan x={viewBox.cx} y={viewBox.cy} dy="-0.3em" className="fill-foreground text-2xl font-bold">
                          {openCount.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={viewBox.cy} dy="1em" className="fill-muted-foreground text-xs">
                          Open
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 max-w-[280px]">
          {donutData.map((item) => (
            <TooltipProvider key={item.name}>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <div className="flex cursor-default items-center gap-1.5">
                    <div className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-muted-foreground">{item.value.toLocaleString()} Work Orders</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
