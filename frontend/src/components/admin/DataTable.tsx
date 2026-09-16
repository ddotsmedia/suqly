'use client';

interface DataTableProps<T> {
  columns: any[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left font-semibold text-gray-700">
                  {typeof col.header === 'string' ? col.header : String(col.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, cidx) => {
                  const accessorKey = (col as any).accessorKey || (col as any).id;
                  let cellValue: any = null;

                  if ((col as any).cell && (row as any)[accessorKey]) {
                    cellValue = (col as any).cell({
                      getValue: () => (row as any)[accessorKey],
                      row: { original: row },
                    });
                  } else {
                    cellValue = (row as any)[accessorKey];
                  }

                  return (
                    <td key={cidx} className="px-4 py-3">
                      {cellValue || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-600">
          {data.length} rows
        </p>
      </div>
    </div>
  );
}
