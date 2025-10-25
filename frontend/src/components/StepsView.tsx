type Step = {
  expr: string;
  explain: string;
};

type Validation = {
  is_correct: boolean;
  details: string[];
};

type StepsViewProps = {
  steps: Step[];
  finalAnswer: string;
  validation: Validation | null;
};

export default function StepsView({ steps, finalAnswer, validation }: StepsViewProps) {
  if (!steps.length && !finalAnswer) {
    return null;
  }

  return (
    <div className="card flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Solution Steps</h2>
        {validation && (
          <span
            className={`rounded-full px-4 py-1 text-xs font-semibold ${
              validation.is_correct
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {validation.is_correct ? "Validated" : "Needs Review"}
          </span>
        )}
      </div>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={`${index}-${step.expr}`} className="flex gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-200">
              {index + 1}
            </span>
            <div className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <p className="font-mono text-slate-100">{step.expr}</p>
              <p className="mt-2 text-sm text-slate-400">{step.explain}</p>
            </div>
          </li>
        ))}
      </ol>
      {finalAnswer && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 text-white">
          <p className="text-xs uppercase tracking-wide text-primary/70">Final Answer</p>
          <p className="mt-1 font-mono text-lg">{finalAnswer}</p>
          {validation?.details?.length ? (
            <p className="mt-2 text-xs text-slate-300">{validation.details[0]}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
