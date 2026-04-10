import * as React from 'react';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardAction,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { filterByDateRange, getWorkOrdersOverTime } from '@/lib/analytics';

const chartConfig = {
  WorkOrders: {
    label: "Work Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function TrendChart() {
  const { workOrders, dateRange } = useWorkOrders();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("all");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d");
    }
  }, [isMobile]);

  const allData = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    const dates = filtered.map(w => w.callDate.getTime()).filter(t => !isNaN(t));
    if (dates.length === 0) return [];

    const range = dateRange || {
      from: new Date(Math.min(...dates)),
      to: new Date(Math.max(...dates)),
    };
    return getWorkOrdersOverTime(filtered, range);
  }, [workOrders, dateRange]);

  const filteredData = useMemo(() => {
    if (timeRange === "all" || allData.length === 0) return allData;

    const daysToSubtract = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : allData.length;
    return allData.slice(-daysToSubtract);
  }, [allData, timeRange]);

  return (
    <Card className="@container/card h-full flex flex-col">
      <CardHeader>
        <CardTitle>Work Orders Over Time</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Volume of tickets submitted over time
          </span>
          <span className="@[540px]/card:hidden">Ticket volume</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full flex-1"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillWorkOrders" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-WorkOrders)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-WorkOrders)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="WorkOrders"
              type="natural"
              fill="url(#fillWorkOrders)"
              stroke="var(--color-WorkOrders)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
