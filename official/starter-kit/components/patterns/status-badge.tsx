import { cn } from "@/lib/utils";

type Status = "active" | "inactive" | "pending" | "error";

type Props = {
  status: Status;
  label?: string;
};

const statusConfig: Record<Status, { defaultLabel: string; className: string }> = {
  active:   { defaultLabel: "有効",   className: "bg-green-100  text-green-800  border-green-200"  },
  inactive: { defaultLabel: "無効",   className: "bg-slate-100  text-slate-600  border-slate-200"  },
  pending:  { defaultLabel: "保留中", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  error:    { defaultLabel: "エラー", className: "bg-red-100    text-red-800    border-red-200"    },
};

export function StatusBadge({ status, label }: Props) {
  const { defaultLabel, className } = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        className
      )}
    >
      {label ?? defaultLabel}
    </span>
  );
}
