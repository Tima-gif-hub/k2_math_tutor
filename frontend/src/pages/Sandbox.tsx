import { useMemo, useState } from "react";

import { SolveResponse, solveProblem } from "../lib/api";

export default function Sandbox() {
  const [problem, setProblem] = useState("d/dx (x**3)");
  const [format, setFormat] = useState<"plain" | "latex">("plain");
  const [level, setLevel] = useState<"school" | "olympiad">("school");
  const [needAlt, setNeedAlt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
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
        err instanceof Error ? err.message : "Sandbox request failed unexpectedly."
      );
    } finally {
      setLoading(false);
    }
  };

  const prettyResponse = useMemo(() => {
    if (!result) return "";
    return JSON.stringify(result, null, 2);
  }, [result]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">K2 Sandbox</h2>
        <p className="text-sm text-slate-300">
          Tweak payload parameters to test latency, alternate strategies, and
          validator behavior.
        </p>
        <label className="text-sm text-slate-300">
          Problem
          <textarea
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">
            Format
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as typeof format)}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-slate-100 focus:border-primary focus:outline-none"
            >
              <option value="plain">Plain</option>
              <option value="latex">LaTeX</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Level
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value as typeof level)}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-slate-100 focus:border-primary focus:outline-none"
            >
              <option value="school">School</option>
              <option value="olympiad">Olympiad</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={needAlt}
            onChange={(event) => setNeedAlt(event.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
          />
          Request alternate method
        </label>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Running…" : "Execute Payload"}
        </button>
        {error && <p className="text-sm text-rose-400">{error}</p>}
        {result?.timings_ms && (
          <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            {Object.entries(result.timings_ms).map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {key}
                </p>
                <p className="text-white">{value} ms</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Response JSON
        </h3>
        <pre className="mt-4 max-h-[480px] overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-xs text-emerald-300">
          {prettyResponse || "// Run the sandbox to inspect raw responses"}
        </pre>
      </section>
    </div>
  );
}
