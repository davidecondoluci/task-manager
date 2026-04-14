import { TaskStatus, STATUS_CONFIG } from "@/types";

interface StatusBadgeProps {
  status: TaskStatus;
}

/**
 * Displays a colored badge for task status.
 * Colors are defined centrally in STATUS_CONFIG for consistency.
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
