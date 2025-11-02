/**
 * TableSkeleton Component
 * 
 * Displays an animated loading skeleton for table components.
 * Shows users that tabular data is being fetched.
 * 
 * Usage:
 *   {isLoading ? <TableSkeleton rows={5} columns={4} /> : <Table data={data} />}
 */

import React from "react";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  compact = false,
}) => {
  const cellHeight = compact ? "h-8" : "h-12";
  const headerHeight = compact ? "h-10" : "h-14";

  return (
    <div className="animate-pulse w-full">
      {/* Table Container */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
        {/* Table Header */}
        {showHeader && (
          <div
            className={`grid bg-slate-800/50 border-b border-slate-700/30 ${headerHeight}`}
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {[...Array(columns)].map((_, i) => (
              <div
                key={i}
                className="flex items-center px-4"
              >
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Table Rows */}
        <div>
          {[...Array(rows)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid border-b border-slate-700/20 last:border-b-0 ${cellHeight} hover:bg-slate-700/10 transition-colors`}
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {[...Array(columns)].map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="flex items-center px-4"
                >
                  {/* First column often has icons or images */}
                  {colIndex === 0 ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 bg-slate-700/40 rounded-full flex-shrink-0"></div>
                      <div className="h-4 bg-slate-700/40 rounded flex-1 max-w-[150px]"></div>
                    </div>
                  ) : (
                    // Random widths for more realistic appearance
                    <div
                      className="h-4 bg-slate-700/40 rounded"
                      style={{
                        width: `${50 + Math.random() * 40}%`,
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton (optional) */}
      <div className="flex items-center justify-between mt-4">
        <div className="h-4 bg-slate-700/40 rounded w-32"></div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-slate-700/40 rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;

