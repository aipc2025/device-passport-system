import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  height?: number;
  horizontal?: boolean;
  stacked?: boolean;
  className?: string;
}

export function BarChart({
  data,
  xKey,
  bars,
  height = 300,
  horizontal = false,
  stacked = false,
  className = '',
}: BarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {horizontal ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey={xKey} type="category" width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} />
              <YAxis />
            </>
          )}
          <Tooltip />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
