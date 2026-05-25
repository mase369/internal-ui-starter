import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

type Props = {
  title: string;
  value: string | number;
  unit?: string;
  trend?: Trend;
  trendLabel?: string;
  className?: string;
};

const trendStyle: Record<Trend, { color: string; icon: string }> = {
  up:   { color: "text-green-600", icon: "▲" },
  down: { color: "text-red-600",   icon: "▼" },
  flat: { color: "text-slate-400", icon: "─" },
};

export function MetricCard({ title, value, unit, trend, trendLabel, className }: Props) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          {unit && <span className="text-sm text-slate-500">{unit}</span>}
        </div>
        {trend && (
          <p className={cn("text-xs mt-1 flex items-center gap-1", trendStyle[trend].color)}>
            <span>{trendStyle[trend].icon}</span>
            {trendLabel && <span>{trendLabel}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
