"use client";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  /** Hide this column from the mobile card layout */
  hideOnMobile?: boolean;
  /** Show this column prominently at the top of the mobile card */
  mobilePrimary?: boolean;
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

export function DataTable<T extends object>({
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
      <div className="py-16 text-center text-muted">
        <p className="mb-2 font-serif text-xl text-green">Nothing here yet</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const mobileColumns = columns.filter((col) => !col.hideOnMobile);
  const primaryColumn =
    mobileColumns.find((col) => col.mobilePrimary) ?? mobileColumns[0];
  const detailColumns = mobileColumns.filter((col) => col !== primaryColumn);
  const actionsColumn = columns.find((col) => col.key === "actions");

  const renderCell = (item: T, col: Column<T>) =>
    col.render
      ? col.render(item)
      : String((item as Record<string, unknown>)[col.key] ?? "");

  return (
    <>
      <ul className="admin-mobile-list">
        {data.map((item) => {
          const id = keyExtractor(item);
          const selected = selectedIds.includes(id);

          return (
            <li key={id}>
              <div
                className={cn(
                  "admin-mobile-card",
                  onRowClick && "cursor-pointer active:bg-cream/50"
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onRowClick(item);
                  }
                }}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                <div className="flex items-start gap-3">
                  {selectable && (
                    <input
                      type="checkbox"
                      checked={selected}
                      className="mt-1 h-5 w-5 shrink-0 accent-terra"
                      onChange={() => onSelect?.(id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${id}`}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    {primaryColumn && (
                      <div className="text-base font-medium text-green">
                        {renderCell(item, primaryColumn)}
                      </div>
                    )}
                    <dl className="mt-3 space-y-2.5">
                      {detailColumns.map((col) => (
                        <div
                          key={col.key}
                          className="flex items-start justify-between gap-4"
                        >
                          <dt className="label-caps shrink-0 text-muted">
                            {col.header}
                          </dt>
                          <dd className="text-right text-sm text-text">
                            {renderCell(item, col)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {actionsColumn && (
                      <div
                        className="mt-4 flex flex-wrap gap-2 border-t border-green/10 pt-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actionsColumn.render?.(item)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-green/10">
              {selectable && (
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" onChange={onSelectAll} />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "label-caps px-4 py-3 text-left text-muted",
                    col.className
                  )}
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
                    "border-b border-green/5 transition-colors hover:bg-cream/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(id)}
                        onChange={() => onSelect?.(id)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3", col.className)}>
                      {renderCell(item, col)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
