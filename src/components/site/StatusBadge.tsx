import { Check, Clock3, Sparkles } from "lucide-react";

export type StatusValue = "confirmed" | "pending" | "optional";

export interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
  showIcon?: boolean;
}

const statusContent = {
  confirmed: {
    label: "已確認",
    Icon: Check,
  },
  pending: {
    label: "待確認",
    Icon: Clock3,
  },
  optional: {
    label: "彈性安排",
    Icon: Sparkles,
  },
} as const;

export function StatusBadge({
  status,
  className = "",
  showIcon = true,
}: StatusBadgeProps) {
  const { label, Icon } = statusContent[status];

  return (
    <span
      className={["status-badge", className].filter(Boolean).join(" ")}
      data-status={status}
    >
      {showIcon ? <Icon aria-hidden="true" size={13} strokeWidth={2} /> : null}
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
