import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  areas: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  height?: number;
  stacked?: boolean;
  className?: string;
}

export function AreaChart({
  data,
  xKey,
  areas,
  height = 300,
  stacked = false,
  className = '',
}: AreaChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsArea data={data}>
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={area.dataKey}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              fill={`url(#gradient-${area.dataKey})`}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </RechartsArea>
      </ResponsiveContainer>
    </div>
  );
}
