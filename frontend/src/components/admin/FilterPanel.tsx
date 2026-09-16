'use client';

import { Input, Button, Select } from '@/components';
import { useState } from 'react';

interface FilterPanelProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  presets?: { label: string; value: Record<string, any> }[];
}

export default function FilterPanel({ filters, onChange, presets }: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleClearAll = () => {
    onChange({});
  };

  return (
    <div className="mb-6">
      <div className="flex gap-4 items-center">
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>

        {Object.keys(filters).length > 0 && (
          <Button variant="ghost" onClick={handleClearAll}>
            Clear All
          </Button>
        )}

        {presets && (
          <Select
            options={presets.map((p) => ({ value: p.label, label: p.label }))}
            onChange={(value) => {
              const preset = presets.find((p) => p.label === value);
              if (preset) onChange(preset.value);
            }}
            placeholder="Load preset"
          />
        )}
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Search..."
              value={filters.search || ''}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />

            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
              ]}
              value={filters.status || ''}
              onChange={(value) => onChange({ ...filters, status: value })}
            />

            <Input
              label="From Date"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            />

            <Input
              label="To Date"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
