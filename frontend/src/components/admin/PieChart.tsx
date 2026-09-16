import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface PieChartProps {
  data: any[];
  dataKey: string;
  nameKey?: string;
  title?: string;
  height?: number;
  colors?: string[];
}

export default function AdminPieChart({
  data,
  dataKey,
  nameKey = 'name',
  title,
  height = 300,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
}: PieChartProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `AED ${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
