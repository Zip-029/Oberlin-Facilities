import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { getSummaryMetrics, filterByDateRange } from '@/lib/analytics';

export function SummaryCards() {
  const { workOrders, dateRange } = useWorkOrders();

  const metrics = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    return getSummaryMetrics(filtered);
  }, [workOrders, dateRange]);

  const overduePercent = metrics.total > 0
    ? ((metrics.overdue / metrics.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 xl:grid-cols-4">
      <Card className="@container/card relative overflow-hidden">

        <CardHeader>
          <CardDescription>Total Work Orders</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {metrics.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">
              All Time
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium text-foreground">
            For selected date range
          </div>
          <div className="text-muted-foreground">
            Total tickets submitted
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative overflow-hidden">

        <CardHeader>
          <CardDescription>Open Work Orders</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {metrics.open.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {metrics.openPercentage.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {metrics.openPercentage.toFixed(1)}% of total
            {metrics.openPercentage > 15 ? <TrendingUp className="size-3.5 text-amber-500" /> : <TrendingDown className="size-3.5 text-emerald-500" />}
          </div>
          <div className="text-muted-foreground hover:text-foreground transition-colors text-xs">
            Currently active tickets
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative overflow-hidden">

        <CardHeader>
          <CardDescription>Overdue</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {metrics.overdue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={metrics.overdue > 0 ? "destructive" : "secondary"}>
              {metrics.overdue > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {overduePercent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            {metrics.overdue > 0 ? 'Needs attention' : 'All on track'}

          </div>
          <div className="text-muted-foreground text-xs">
            Past target due date
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card relative overflow-hidden">

        <CardHeader>
          <CardDescription>Avg Completion Time</CardDescription>
          <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
            {metrics.avgDaysToComplete.toFixed(1)} <span className="text-sm font-medium text-muted-foreground">days</span>
          </CardTitle>
          <CardAction>
            <Badge variant="secondary">
              Avg
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            Processing efficiency

          </div>
          <div className="text-muted-foreground text-xs">
            Call date to completion
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
