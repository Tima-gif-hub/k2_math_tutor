from typing import Dict, List, Literal

STRICT_JSON_SYSTEM_PROMPT = (
    "You are a strict math tutor. Reply ONLY valid JSON per schema. No text outside JSON."
)


def build_solve_payload(
    problem: str, level: Literal["school", "olympiad"], fmt: Literal["plain", "latex"]
) -> Dict:
    math_format = "latex" if fmt == "latex" else "plain"
    return {
        "system": STRICT_JSON_SYSTEM_PROMPT,
        "problem": problem,
        "level": level,
        "required_fields": ["steps", "final_answer", "alts"],
        "format_rules": {"math": math_format, "json_only": True, "max_tokens": 512},
    }


def build_explain_payload(
    problem: str, student_steps: List[str]
) -> Dict[str, object]:
    return {
        "system": STRICT_JSON_SYSTEM_PROMPT,
        "problem": problem,
        "student_steps": student_steps,
        "required_fields": ["misconceptions", "fixed_steps", "didactic_note"],
        "format_rules": {"json_only": True},
    }


def build_alt_method_payload(
    problem: str, level: Literal["school", "olympiad"], fmt: Literal["plain", "latex"]
) -> Dict[str, object]:
    math_format = "latex" if fmt == "latex" else "plain"
    return {
        "system": STRICT_JSON_SYSTEM_PROMPT,
        "problem": problem,
        "level": level,
        "format_rules": {"math": math_format, "json_only": True},
    }
