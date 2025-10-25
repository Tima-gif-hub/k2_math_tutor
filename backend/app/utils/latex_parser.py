from typing import Literal

from sympy import Expr
from sympy.parsing.latex import parse_latex
from sympy.parsing.sympy_parser import parse_expr


def to_sympy_expr(expression: str, fmt: Literal["plain", "latex"] = "plain") -> Expr:
    """Convert plain text or LaTeX math into a SymPy expression."""
    normalized = expression.strip()
    if not normalized:
        raise ValueError("Empty expression cannot be parsed")

    if fmt == "latex":
        return parse_latex(normalized)
    return parse_expr(normalized, evaluate=True)
