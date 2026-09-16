import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKey: string;
  title?: string;
  height?: number;
  color?: string;
}

export default function AdminLineChart({
  data,
  dataKey,
  title,
  height = 300,
  color = '#3b82f6',
}: LineChartProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `AED ${value}`} />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
