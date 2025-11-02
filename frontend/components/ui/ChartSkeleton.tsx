/**
 * ChartSkeleton Component
 * 
 * Displays an animated loading skeleton for chart components.
 * Improves perceived performance by showing users that data is loading.
 * 
 * Usage:
 *   {isLoading ? <ChartSkeleton /> : <Chart data={data} />}
 */

import React from "react";

interface ChartSkeletonProps {
  height?: number;
  showTitle?: boolean;
  showLegend?: boolean;
  bars?: number;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  height = 300,
  showTitle = true,
  showLegend = true,
  bars = 7,
}) => {
  return (
    <div className="animate-pulse">
      {/* Title */}
      {showTitle && (
        <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-4"></div>
      )}

      {/* Chart Area */}
      <div
        className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30"
        style={{ height: `${height}px` }}
      >
        {/* Y-axis labels */}
        <div className="flex h-full">
          <div className="flex flex-col justify-between w-12 mr-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-700/40 rounded w-full"></div>
            ))}
          </div>

          {/* Chart bars/lines */}
          <div className="flex-1 flex items-end justify-between gap-2">
            {[...Array(bars)].map((_, i) => {
              // Random heights for more realistic skeleton
              const randomHeight = 40 + Math.random() * 60;
              return (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-500/5 rounded-t"
                  style={{ height: `${randomHeight}%` }}
                ></div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 ml-14">
          {[...Array(bars)].map((_, i) => (
            <div key={i} className="h-3 bg-slate-700/40 rounded w-12"></div>
          ))}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-700/50 rounded"></div>
              <div className="h-4 bg-slate-700/40 rounded w-20"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartSkeleton;

