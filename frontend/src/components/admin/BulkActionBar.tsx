'use client';

import { Button } from '@/components';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onDelete,
  onExport,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-center">
      <p className="font-semibold text-blue-900">{selectedCount} items selected</p>
      <div className="flex gap-2">
        {onApprove && (
          <Button size="sm" variant="primary" onClick={onApprove}>
            Approve All
          </Button>
        )}
        {onReject && (
          <Button size="sm" variant="danger" onClick={onReject}>
            Reject All
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="danger" onClick={onDelete}>
            Delete All
          </Button>
        )}
        {onExport && (
          <Button size="sm" variant="secondary" onClick={onExport}>
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
