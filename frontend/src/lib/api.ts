import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE ?? "";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  }
});

export type SolveRequestBody = {
  problem: string;
  format: "plain" | "latex";
  level: "school" | "olympiad";
  need_alt: boolean;
};

export type SolveResponse = {
  steps: { expr: string; explain: string }[];
  final_answer: string;
  validation: { is_correct: boolean; details: string[] };
  alts: { title: string; outline: string[] }[];
  timings_ms: Record<string, number>;
};

export type ExplainResponse = {
  misconceptions: string[];
  fixed_steps: string[];
  didactic_note: string;
};

export type ValidateResponse = {
  is_correct: boolean;
  details: string[];
};

export const solveProblem = async (payload: SolveRequestBody) => {
  const response = await api.post<SolveResponse>("/api/solve", payload);
  return response.data;
};

export const explainMisconception = async (payload: {
  problem: string;
  student_steps: string[];
}) => {
  const response = await api.post<ExplainResponse>("/api/explain", payload);
  return response.data;
};

export const validateAnswer = async (payload: {
  problem: string;
  final_answer: string;
  format?: "plain" | "latex";
}) => {
  const response = await api.post<ValidateResponse>("/api/validate", payload);
  return response.data;
};
