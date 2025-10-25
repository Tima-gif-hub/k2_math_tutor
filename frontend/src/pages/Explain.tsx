import { FormEvent, useState } from "react";

import { ExplainResponse, explainMisconception } from "../lib/api";

export default function Explain() {
  const [problem, setProblem] = useState("x + 5 = 7");
  const [studentSteps, setStudentSteps] = useState("x = 7 + 5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResponse | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const stepsArray = studentSteps
        .split("\n")
        .map((step) => step.trim())
        .filter(Boolean);
      const data = await explainMisconception({
        problem,
        student_steps: stepsArray
      });
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate explanation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="card">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-sm text-slate-300">
            Problem
            <textarea
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 focus:border-primary focus:outline-none"
            />
          </label>
          <label className="text-sm text-slate-300">
            Student Steps
            <textarea
              value={studentSteps}
              onChange={(event) => setStudentSteps(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-100 focus:border-primary focus:outline-none"
              placeholder="One step per line"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Analyze Misconceptions"}
          </button>
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">K2 Diagnostic</h2>
        {result ? (
          <>
            <div>
              <h3 className="text-sm font-semibold text-primary">Misconceptions</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {result.misconceptions.map((item, index) => (
                  <li key={`mis-${index}`}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-primary">Fixed Steps</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {result.fixed_steps.map((item, index) => (
                  <li key={`fix-${index}`}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
              <h3 className="text-xs uppercase tracking-wide text-slate-500">
                Didactic Note
              </h3>
              <p className="mt-2 leading-relaxed">{result.didactic_note}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Submit a student solution to surface common misconceptions and
            corrective feedback.
          </p>
        )}
      </section>
    </div>
  );
}
