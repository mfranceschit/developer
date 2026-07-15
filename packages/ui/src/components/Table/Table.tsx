import type { ReactNode } from 'react';

export type TableColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
};

const headerCellClasses =
  'px-3 py-2 font-sans text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] ' +
  'border-b border-[var(--border-subtle)]';

const bodyCellClasses = 'px-3 py-2 font-sans text-sm text-[var(--text-body)]';

export function Table<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  className = '',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table
        className={['w-full min-w-[560px] border-collapse', className].filter(Boolean).join(' ')}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={[
                  headerCellClasses,
                  column.align === 'right' ? 'text-right' : 'text-left',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={[
                'border-b border-[var(--border-subtle)] last:border-b-0',
                onRowClick ? 'cursor-pointer hover:bg-[var(--primary-soft)]' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={[
                    bodyCellClasses,
                    column.align === 'right' ? 'text-right' : 'text-left',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
