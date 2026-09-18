'use client';

import { useState } from 'react';
import { useSaveSearch } from '@/hooks/useSavedSearches';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  initialQuery?: Record<string, any>;
  initialFilters?: Record<string, any>;
}

export function SaveSearchModal({
  isOpen,
  onClose,
  onSave,
  initialQuery = {},
  initialFilters = {},
}: SaveSearchModalProps) {
  const [name, setName] = useState('');
  const [emailAlert, setEmailAlert] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const { save, isSaving, error } = useSaveSearch(initialQuery, initialFilters);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save(name, emailAlert, frequency);
      setName('');
      setEmailAlert(false);
      setFrequency('daily');
      onClose();
      onSave?.();
    } catch (err) {
      console.error('Failed to save search:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Save This Search</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Budget iPhones in Dubai"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emailAlert"
              checked={emailAlert}
              onChange={(e) => setEmailAlert(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="emailAlert" className="text-sm font-medium">
              Enable email alerts
            </label>
          </div>

          {emailAlert && (
            <div>
              <label className="block text-sm font-medium mb-1">Alert Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isSaving || !name}
            >
              {isSaving ? 'Saving...' : 'Save Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
