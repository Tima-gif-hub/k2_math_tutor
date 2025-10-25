from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_mock_solve_contract() -> None:
    payload = {
        "problem": "x + 5 = 7",
        "level": "school",
        "required_fields": ["steps", "final_answer", "alts"],
        "format_rules": {"math": "plain", "json_only": True, "max_tokens": 512},
    }
    response = client.post("/mock-k2/solve_steps", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"steps", "final_answer", "alts", "caveats"}
    assert data["steps"] and "expr" in data["steps"][0]
    assert isinstance(data["alts"], list)


def test_mock_explain_contract() -> None:
    payload = {
        "problem": "x + 5 = 7",
        "student_steps": ["x = 7 - 5"],
        "required_fields": ["misconceptions", "fixed_steps", "didactic_note"],
        "format_rules": {"json_only": True},
    }
    response = client.post("/mock-k2/explain_misconception", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"misconceptions", "fixed_steps", "didactic_note"}
    assert data["misconceptions"]
    assert data["fixed_steps"]


def test_mock_alt_contract() -> None:
    payload = {
        "problem": "x + 5 = 7",
        "level": "school",
        "format_rules": {"math": "plain", "json_only": True},
    }
    response = client.post("/mock-k2/generate_alt_method", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "alt" in data
    assert set(data["alt"].keys()) == {"title", "outline"}
