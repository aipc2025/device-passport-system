import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
  height?: number;
  innerRadius?: number;
  showLabels?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function PieChart({
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  innerRadius = 0,
  showLabels = true,
  className = '',
}: PieChartProps) {
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / entry.payload.total) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius > 0 ? '80%' : '70%'}
            fill="#8884d8"
            dataKey="value"
            label={showLabels ? renderLabel : false}
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
