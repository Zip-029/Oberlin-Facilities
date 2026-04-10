import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useWorkOrders } from '@/context/WorkOrderContext';
import { filterByDateRange, getCategoryRankings } from '@/lib/analytics';

const chartConfig = {
  value: {
    label: "Work Orders",
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export function CategoryChart() {
  const { workOrders, dateRange } = useWorkOrders();

  const data = useMemo(() => {
    const filtered = dateRange ? filterByDateRange(workOrders, dateRange) : workOrders;
    return getCategoryRankings(filtered).slice(0, 10);
  }, [workOrders, dateRange]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Work Orders by Category</CardTitle>
        <CardDescription>Volume ranked by trade type (Top 10)</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
              right: 48,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} barSize={24}>
              <LabelList
                dataKey="name"
                position="insideLeft"
                offset={12}
                className="fill-(--color-label) font-medium"
                fontSize={12}
              />
              <LabelList
                dataKey="value"
                position="right"
                offset={12}
                className="fill-foreground font-medium"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground">
          Showing top 10 trade categories by volume
        </div>
      </CardFooter>
    </Card>
  );
}
