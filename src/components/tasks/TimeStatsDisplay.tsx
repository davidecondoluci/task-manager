import { TimeStats, formatHours } from "@/lib/stats";

interface TimeStatsDisplayProps {
  stats: TimeStats;
}

/**
 * Displays time statistics in a compact grid.
 *
 * Design: Simple grid with 4 stat boxes.
 * No charts - just clear numbers as requested.
 */
export function TimeStatsDisplay({ stats }: TimeStatsDisplayProps) {
  const items = [
    { label: "Total Estimated", value: stats.total, color: "text-gray-900" },
    { label: "To Do", value: stats.todo, color: "text-yellow-600" },
    { label: "In Progress", value: stats.inProgress, color: "text-blue-600" },
    { label: "Completed", value: stats.done, color: "text-green-600" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h2 className="text-sm font-medium text-gray-500 mb-3">Time Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className={`text-2xl font-semibold ${item.color}`}>
              {formatHours(item.value)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
