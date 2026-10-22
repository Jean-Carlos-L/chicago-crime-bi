interface Props {
   title: string;
   value: string | null | undefined;
   hint?: string;
   loading?: boolean;
   tone?: "good" | "bad" | "neutral" | "muted";
}

const TONE = {
   good: { value: "text-good", border: "border-l-good" },
   bad: { value: "text-bad", border: "border-l-bad" },
   neutral: { value: "text-text", border: "border-l-primary" },
   muted: { value: "text-muted", border: "border-l-primary" },
} as const;

export default function KpiCard({ title, value, hint, loading, tone = "neutral" }: Props) {
   const styles = TONE[tone];

   return (
      <div
         aria-busy={loading}
         className={`min-h-[126px] min-w-0 rounded-xl border border-border border-l-[3px] bg-surface p-4 shadow-sm shadow-black/30 ${styles.border}`}
      >
         <div className="text-xs font-medium uppercase tracking-wide text-muted">{title}</div>
         {loading ? (
            <div className="mt-2 h-9 w-28 animate-pulse rounded-md bg-surface-2" aria-hidden="true" />
         ) : (
            <div title={value ?? undefined} className={`mt-1.5 truncate text-3xl font-semibold tabular-nums ${styles.value}`}>
               {value ?? "—"}
            </div>
         )}
         <div className="mt-1 min-h-8 text-xs text-muted">
            {loading ? (
               <span className="mt-1 block h-3 w-40 animate-pulse rounded bg-surface-2" aria-hidden="true" />
            ) : (
               <span className="line-clamp-2">{hint}</span>
            )}
         </div>
      </div>
   );
}
