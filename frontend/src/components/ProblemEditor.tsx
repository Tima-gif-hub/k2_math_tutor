import katex from "katex";
import { useMemo } from "react";

type ProblemEditorProps = {
  value: string;
  format: "plain" | "latex";
  onChange: (value: string) => void;
  onFormatChange: (format: "plain" | "latex") => void;
  label?: string;
};

export default function ProblemEditor({
  value,
  format,
  onChange,
  onFormatChange,
  label
}: ProblemEditorProps) {
  const renderedLatex = useMemo(() => {
    if (format !== "latex" || !value.trim()) {
      return null;
    }
    try {
      return katex.renderToString(value, {
        throwOnError: false,
        displayMode: true
      });
    } catch (error) {
      return `<span class="text-red-500">Invalid LaTeX: ${
        (error as Error).message
      }</span>`;
    }
  }, [value, format]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          {label ?? "Problem"}
        </label>
        <div className="inline-flex gap-2 rounded-full bg-slate-800 p-1 text-xs">
          <button
            type="button"
            onClick={() => onFormatChange("plain")}
            className={`rounded-full px-3 py-1 ${
              format === "plain"
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            Plain
          </button>
          <button
            type="button"
            onClick={() => onFormatChange("latex")}
            className={`rounded-full px-3 py-1 ${
              format === "latex"
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            LaTeX
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm text-slate-200 shadow-inner focus:border-primary focus:outline-none"
        placeholder={
          format === "latex"
            ? "e.g. x^2 + 3x = 10"
            : "Enter a math problem, e.g. solve x + 5 = 7"
        }
      />
      {renderedLatex && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            Preview
          </p>
          <div
            className="text-lg text-white"
            dangerouslySetInnerHTML={{ __html: renderedLatex }}
          />
        </div>
      )}
    </div>
  );
}
