import pytest

from app.services.sympy_validator import SympyValidator


@pytest.fixture(scope="module")
def validator() -> SympyValidator:
    return SympyValidator()


def test_equation_validation_success(validator: SympyValidator) -> None:
    result = validator.validate("x + 5 = 7", "x = 2")
    assert result.is_correct
    assert "Solutions match" in result.details[0]


def test_equation_validation_failure(validator: SympyValidator) -> None:
    result = validator.validate("x + 5 = 7", "x = 5")
    assert not result.is_correct


def test_derivative_validation(validator: SympyValidator) -> None:
    result = validator.validate("d/dx (x**2 + 3*x)", "2*x + 3")
    assert result.is_correct


def test_integral_validation(validator: SympyValidator) -> None:
    result = validator.validate("int x dx", "x**2/2")
    assert result.is_correct
