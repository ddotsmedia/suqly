interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: string;
  className?: string;
}

export default function AnalyticsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className = '',
}: AnalyticsCardProps) {
  const trendIsPositive = trend?.startsWith('+');

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-gray-600 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      {trend && (
        <p className={`text-sm font-semibold ${trendIsPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend} from last month
        </p>
      )}
    </div>
  );
}
