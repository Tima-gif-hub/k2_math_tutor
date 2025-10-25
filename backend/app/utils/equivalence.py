from __future__ import annotations

from itertools import product
from typing import Iterable, Sequence

from sympy import Eq, Expr, simplify


def expressions_equivalent(lhs: Expr, rhs: Expr) -> bool:
    """Compare two expressions symbolically."""
    try:
        return bool(simplify(lhs - rhs) == 0)
    except Exception:
        return False


def numeric_check(
    lhs: Expr,
    rhs: Expr,
    sample_points: Iterable[int] = (-2, -1, 0, 1, 2),
) -> bool:
    """Fallback numeric comparison across sample points."""
    symbols = list(lhs.free_symbols.union(rhs.free_symbols))
    if not symbols:
        return expressions_equivalent(lhs, rhs)

    for values in product(sample_points, repeat=len(symbols)):
        subs = dict(zip(symbols, values))
        try:
            lval = lhs.subs(subs).evalf()
            rval = rhs.subs(subs).evalf()
        except Exception:
            continue
        if abs(lval - rval) > 1e-6:
            return False
    return True


def derivative_equivalent(
    derivative: Expr,
    original: Expr,
    respect_to: Expr,
) -> bool:
    """Verify that `derivative` is the derivative of `original`."""
    try:
        return expressions_equivalent(derivative, original.diff(respect_to))
    except Exception:
        return False


def integral_equivalent(
    integral: Expr,
    integrand: Expr,
    respect_to: Expr,
) -> bool:
    """Verify an indefinite integral up to a constant."""
    try:
        derived = integral.diff(respect_to)
        return expressions_equivalent(derived, integrand)
    except Exception:
        return False
