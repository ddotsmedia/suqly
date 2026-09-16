'use client';

interface WebSocketIndicatorProps {
  status: 'connected' | 'connecting' | 'disconnected';
}

export default function WebSocketIndicator({ status }: WebSocketIndicatorProps) {
  const statusConfig = {
    connected: { color: 'bg-green-500', label: 'Connected', dot: '●' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting...', dot: '◐' },
    disconnected: { color: 'bg-gray-400', label: 'Disconnected', dot: '○' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded border text-sm">
      <span className={`${config.color} w-3 h-3 rounded-full inline-block`} />
      <span className="text-gray-600">{config.label}</span>
    </div>
  );
}
