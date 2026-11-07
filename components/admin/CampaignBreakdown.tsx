import { formatPrice } from "@/lib/format";
import type { CampaignStats } from "@/lib/orders";

export default function CampaignBreakdown({ stats }: { stats: CampaignStats[] }) {
  const top = stats.slice(0, 6);
  const maxCount = Math.max(1, ...top.map((s) => s.orderCount));

  return (
    <div className="rounded-xl border border-surface-line bg-white p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">Orders by source</p>
        <p className="text-right text-[11px] text-ink/40">revenue = delivered only</p>
      </div>

      {top.length === 0 ? (
        <p className="py-10 text-center text-xs text-ink/50">No orders yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {top.map((s) => (
            <div key={`${s.source}-${s.campaign}`}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span
                  className="truncate font-medium text-ink"
                  title={s.campaign ? `${s.source} — ${s.campaign}` : s.source}
                >
                  {s.source}
                  {s.campaign ? <span className="text-ink/40"> — {s.campaign}</span> : null}
                </span>
                <span className="shrink-0 text-ink/60">
                  {s.orderCount} order{s.orderCount === 1 ? "" : "s"} &middot; {formatPrice(s.revenue)}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${(s.orderCount / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
