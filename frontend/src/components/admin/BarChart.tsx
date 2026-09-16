import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  title?: string;
  height?: number;
  color?: string;
  layout?: 'vertical' | 'horizontal';
}

export default function AdminBarChart({
  data,
  dataKey,
  title,
  height = 300,
  color = '#3b82f6',
  layout = 'horizontal',
}: BarChartProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `AED ${value}`} />
          <Legend />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
