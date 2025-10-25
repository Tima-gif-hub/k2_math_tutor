import { useState } from "react";

import MetricsBar from "../components/MetricsBar";
import ProblemEditor from "../components/ProblemEditor";
import StepsView from "../components/StepsView";
import { SolveResponse, solveProblem } from "../lib/api";

export default function Solve() {
  const [problem, setProblem] = useState("x + 5 = 7");
  const [format, setFormat] = useState<"plain" | "latex">("plain");
  const [level, setLevel] = useState<"school" | "olympiad">("school");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SolveResponse | null>(null);

  const triggerSolve = async (needAlt: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const data = await solveProblem({
        problem,
        format,
        level,
        need_alt: needAlt
      });
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch solution steps."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="card">
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void triggerSolve(false);
          }}
        >
          <ProblemEditor
            value={problem}
            format={format}
            onChange={setProblem}
            onFormatChange={setFormat}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as typeof level)}
                className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-slate-100 focus:border-primary focus:outline-none"
              >
                <option value="school">School</option>
                <option value="olympiad">Olympiad</option>
              </select>
            </label>
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Solving…" : "Solve Problem"}
              </button>
            </div>
            {result && (
              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => triggerSolve(true)}
                  className="rounded-lg border border-primary/60 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Another Method
                </button>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>
      </section>

      <MetricsBar
        level={level}
        format={format}
        timings={result?.timings_ms ?? null}
        validationState={result?.validation?.is_correct ?? null}
      />

      <StepsView
        steps={result?.steps ?? []}
        finalAnswer={result?.final_answer ?? ""}
        validation={result?.validation ?? null}
      />

      {result?.alts?.length ? (
        <section className="card">
          <h2 className="text-lg font-semibold text-white">Alternate Methods</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {result.alts.map((alt) => (
              <article
                key={alt.title}
                className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
              >
                <h3 className="text-sm font-semibold text-primary">{alt.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {alt.outline.map((item, index) => (
                    <li key={`${alt.title}-${index}`}>• {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
