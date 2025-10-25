from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Literal, Optional, Tuple

from sympy import Eq, Expr, symbols
from sympy.parsing.sympy_parser import parse_expr
from sympy.solvers import solve

from ..schemas.solution import ValidationResult
from ..utils.equivalence import (
    derivative_equivalent,
    expressions_equivalent,
    integral_equivalent,
    numeric_check,
)
from ..utils.latex_parser import to_sympy_expr


class UnsupportedProblemError(Exception):
    """Raised when the validator cannot handle the problem type."""


@dataclass
class ValidationContext:
    problem: str
    final_answer: str
    fmt: Literal["plain", "latex"]


class SympyValidator:
    """Minimal SymPy-based validator for core math tasks."""

    def validate(
        self,
        problem: str,
        final_answer: str,
        fmt: Optional[Literal["plain", "latex"]] = "plain",
    ) -> ValidationResult:
        fmt = fmt or "plain"
        ctx = ValidationContext(problem=problem.strip(), final_answer=final_answer, fmt=fmt)
        handlers = (
            self._validate_derivative,
            self._validate_integral,
            self._validate_equation_or_system,
        )
        details: List[str] = []
        for handler in handlers:
            try:
                return handler(ctx)
            except UnsupportedProblemError as exc:
                details.append(str(exc))
            except Exception as exc:  # pragma: no cover - defensive guardrail
                details.append(f"Validator error: {exc}")
                return ValidationResult(is_correct=False, details=details)

        details.append("Validator could not determine how to validate this problem.")
        return ValidationResult(is_correct=False, details=details)

    # --- handler implementations -------------------------------------------------

    def _validate_equation_or_system(self, ctx: ValidationContext) -> ValidationResult:
        equations = self._extract_equations(ctx.problem)
        if not equations:
            raise UnsupportedProblemError("Not an equation or system of equations.")

        parsed_equations = []
        for lhs, rhs in equations:
            parsed_equations.append(Eq(self._parse_expression(lhs, ctx.fmt), self._parse_expression(rhs, ctx.fmt)))

        symbols_in_problem = sorted({str(sym) for eq in parsed_equations for sym in eq.free_symbols})
        if not symbols_in_problem:
            raise UnsupportedProblemError("Equation does not expose any symbolic variables.")

        sympy_symbols = [symbols(name) for name in symbols_in_problem]
        solve_target = sympy_symbols if len(sympy_symbols) > 1 else sympy_symbols[0]
        expected_solutions = solve(parsed_equations, solve_target, dict=True)
        normalized_expected = {self._normalize_solution(sol) for sol in expected_solutions}

        provided_solutions = self._parse_final_answer(ctx.final_answer)
        if not provided_solutions:
            return ValidationResult(
                is_correct=False,
                details=["Could not parse final answer into symbolic assignments."],
            )
        normalized_provided = {self._normalize_solution(sol) for sol in provided_solutions}

        is_correct = normalized_provided == normalized_expected
        details = ["Solutions match expected result." if is_correct else "Provided solution set does not match."]
        return ValidationResult(is_correct=is_correct, details=details)

    def _validate_derivative(self, ctx: ValidationContext) -> ValidationResult:
        derivative_info = self._extract_derivative(ctx.problem)
        if derivative_info is None:
            raise UnsupportedProblemError("Not a derivative problem.")

        respect_to, expression = derivative_info
        respect_symbol = symbols(respect_to)
        original_expr = self._parse_expression(expression, ctx.fmt)
        provided = self._parse_expression(ctx.final_answer, ctx.fmt)

        if derivative_equivalent(provided, original_expr, respect_symbol):
            return ValidationResult(
                is_correct=True,
                details=["Derivative matches symbolic differentiation."],
            )

        if numeric_check(
            provided,
            original_expr.diff(respect_symbol),
        ):
            return ValidationResult(
                is_correct=True,
                details=["Derivative matches across sampled points."],
            )

        return ValidationResult(
            is_correct=False,
            details=["Provided derivative does not match symbolic result."],
        )

    def _validate_integral(self, ctx: ValidationContext) -> ValidationResult:
        integral_info = self._extract_integral(ctx.problem)
        if integral_info is None:
            raise UnsupportedProblemError("Not an integral problem.")

        integrand_str, respect_to = integral_info
        respect_symbol = symbols(respect_to)
        integrand_expr = self._parse_expression(integrand_str, ctx.fmt)
        provided = self._parse_expression(ctx.final_answer, ctx.fmt)

        if integral_equivalent(provided, integrand_expr, respect_symbol):
            return ValidationResult(
                is_correct=True,
                details=["Integral differentiates back to the integrand."],
            )

        return ValidationResult(
            is_correct=False,
            details=["Provided integral does not differentiate to the integrand."],
        )

    # --- parsing helpers ---------------------------------------------------------

    def _parse_expression(self, expr: str, fmt: Literal["plain", "latex"]) -> Expr:
        try:
            return to_sympy_expr(expr, fmt)
        except Exception:
            # attempt plain parse as fallback
            return parse_expr(expr)

    @staticmethod
    def _extract_equations(problem: str) -> List[Tuple[str, str]]:
        candidates = re.split(r"\n|;", problem)
        equations = []
        for candidate in candidates:
            if "=" not in candidate:
                continue
            lhs, rhs = candidate.split("=", 1)
            equations.append((lhs.strip(), rhs.strip()))
        return equations

    @staticmethod
    def _parse_final_answer(final_answer: str) -> List[Dict[str, Expr]]:
        solutions: List[Dict[str, Expr]] = []
        chunks = [chunk.strip() for chunk in re.split(r"\n|;", final_answer) if chunk.strip()]
        if not chunks:
            chunks = [final_answer.strip()]

        for chunk in chunks:
            assignments: Dict[str, Expr] = {}
            matches = re.findall(r"([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([^\],]+(?:\[[^\]]*\])?)", chunk)
            if not matches:
                continue
            for var, raw_value in matches:
                cleaned = raw_value.strip()
                values = SympyValidator._split_values(cleaned)
                if len(values) > 1:
                    for value in values:
                        try:
                            solutions.append({var: parse_expr(value)})
                        except Exception:
                            continue
                    assignments = {}
                    break
                try:
                    assignments[var] = parse_expr(values[0])
                except Exception:
                    assignments = {}
                    break
            if assignments:
                solutions.append(assignments)

        return solutions

    @staticmethod
    def _split_values(raw: str) -> List[str]:
        cleaned = raw.strip()
        if cleaned.startswith("[") and cleaned.endswith("]"):
            inner = cleaned[1:-1]
            return [value.strip() for value in inner.split(",") if value.strip()]
        if "," in cleaned:
            return [value.strip() for value in cleaned.split(",") if value.strip()]
        return [cleaned]

    @staticmethod
    def _normalize_solution(solution: Dict[str, Expr]) -> Tuple[Tuple[str, Expr], ...]:
        normalized: List[Tuple[str, Expr]] = []
        for key, value in solution.items():
            var_name = str(key)
            normalized.append((var_name, value.simplify()))
        return tuple(sorted(normalized))

    @staticmethod
    def _extract_derivative(problem: str) -> Optional[Tuple[str, str]]:
        # plain text form d/dx (...)
        match_plain = re.search(r"d/d([a-zA-Z])\s*\((.+)\)", problem)
        if match_plain:
            return match_plain.group(1), match_plain.group(2)
        # compact form d/dx f(x)
        match_compact = re.search(r"d/d([a-zA-Z])\s*(.+)", problem)
        if match_compact:
            return match_compact.group(1), match_compact.group(2)
        # latex form \frac{d}{dx} (...)
        match_latex = re.search(r"\\frac{d}{d([a-zA-Z])}\s*(.+)", problem)
        if match_latex:
            return match_latex.group(1), match_latex.group(2)
        return None

    @staticmethod
    def _extract_integral(problem: str) -> Optional[Tuple[str, str]]:
        match_plain = re.search(r"int\s+(.+)\s+d([a-zA-Z])", problem, flags=re.IGNORECASE)
        if match_plain:
            return match_plain.group(1), match_plain.group(2)
        match_symbol = re.search(r"∫\s*(.+)\s*d([a-zA-Z])", problem)
        if match_symbol:
            return match_symbol.group(1), match_symbol.group(2)
        match_latex = re.search(r"\\int\s*(.+)\s*d([a-zA-Z])", problem)
        if match_latex:
            return match_latex.group(1), match_latex.group(2)
        return None
