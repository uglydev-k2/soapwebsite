"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = "No data found",
  selectable,
  selectedIds = [],
  onSelect,
  onSelectAll,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="font-serif text-xl text-green mb-2">Nothing here yet</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-green/10">
            {selectable && (
              <th className="py-3 px-4 text-left w-10">
                <input type="checkbox" onChange={onSelectAll} />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("py-3 px-4 text-left label-caps text-muted", col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const id = keyExtractor(item);
            return (
              <tr
                key={id}
                className={cn(
                  "border-b border-green/5 hover:bg-cream/50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {selectable && (
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={() => onSelect?.(id)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn("py-3 px-4", col.className)}>
                    {col.render
                      ? col.render(item)
                      : String(item[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
