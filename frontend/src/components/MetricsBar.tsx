type MetricsBarProps = {
  level: "school" | "olympiad";
  format: "plain" | "latex";
  timings: Record<string, number> | null;
  validationState: boolean | null;
};

export default function MetricsBar({
  level,
  format,
  timings,
  validationState
}: MetricsBarProps) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:grid-cols-4">
      <Metric label="Problem Level" value={level} />
      <Metric label="Format" value={format} />
      <Metric
        label="K2 Latency"
        value={timings ? `${timings.k2 ?? 0} ms` : "—"}
      />
      <Metric
        label="Validator"
        value={
          validationState === null ? "—" : validationState ? "passed" : "failed"
        }
        tone={
          validationState === null
            ? "muted"
            : validationState
              ? "positive"
              : "negative"
        }
      />
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
  tone?: "muted" | "positive" | "negative";
};

function Metric({ label, value, tone = "muted" }: MetricProps) {
  const toneStyles: Record<typeof tone, string> = {
    muted: "text-slate-300",
    positive: "text-emerald-300",
    negative: "text-rose-300"
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-lg font-semibold ${toneStyles[tone]}`}>{value}</p>
    </div>
  );
}
