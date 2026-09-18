'use client';

import { useState, useRef } from 'react';
import { Upload, X, Download } from 'lucide-react';
import Papa from 'papaparse';

interface CsvRow {
  [key: string]: string;
}

interface FieldMapping {
  title: string;
  category: string;
  price: string;
  description?: string;
  condition?: string;
  location?: string;
  phone?: string;
  whatsapp_enabled?: string;
  telegram_username?: string;
}

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, fieldMapping: FieldMapping) => Promise<void>;
}

export function CsvImportModal({
  isOpen,
  onClose,
  onImport,
}: CsvImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Partial<FieldMapping>>({
    title: 'title',
    category: 'category',
    price: 'price',
  });
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type === 'text/csv' || f.name.endsWith('.csv'),
    );
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setCsvData((results.data as CsvRow[]).slice(0, 3));
      },
      error: (error) => {
        alert(`CSV parsing error: ${error.message}`);
      },
    });
  };

  const handleDownloadTemplate = () => {
    const templateCsv = [
      ['title', 'category', 'price', 'description', 'condition', 'location', 'phone', 'whatsapp_enabled', 'telegram_username'].join(','),
      ['iPhone 15 Pro Max', 'goods', '4500', 'Excellent condition', 'used', 'dubai', '+971501234567', 'yes', '@username'].join(','),
    ].join('\n');

    const blob = new Blob([templateCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listings-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    if (!fieldMapping.title || !fieldMapping.category || !fieldMapping.price) {
      alert('Please map required fields: title, category, price');
      return;
    }

    setIsImporting(true);
    try {
      await onImport(csvFile, fieldMapping as FieldMapping);
      setCsvFile(null);
      setCsvData([]);
      setHeaders([]);
      setFieldMapping({ title: 'title', category: 'category', price: 'price' });
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Import Listings from CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!csvFile ? (
            <>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 mb-4"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Drag CSV file here or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:underline"
                  >
                    click to browse
                  </button>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">Map CSV Columns</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['title', 'category', 'price', 'description', 'condition', 'location'].map(
                    (field) => (
                      <div key={field}>
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {field} {['title', 'category', 'price'].includes(field) && '*'}
                        </label>
                        <select
                          value={fieldMapping[field as keyof FieldMapping] || ''}
                          onChange={(e) =>
                            setFieldMapping({
                              ...fieldMapping,
                              [field]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select column</option>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Preview (First 3 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        {headers.slice(0, 5).map((header) => (
                          <th key={header} className="px-3 py-2 text-left border-r">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, idx) => (
                        <tr key={idx} className="border-t">
                          {headers.slice(0, 5).map((header) => (
                            <td key={header} className="px-3 py-2 border-r text-gray-600">
                              {row[header]?.substring(0, 20)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCsvFile(null);
                    setCsvData([]);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
                >
                  Choose Different File
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
