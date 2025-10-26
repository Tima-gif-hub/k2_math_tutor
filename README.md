# K2 Math Tutor

K2 Math Tutor is a full-stack web application that produces step-by-step math solutions, validates answers with SymPy, and analyzes learner misconceptions. A React (Vite + TypeScript + Tailwind) frontend talks to a FastAPI backend that brokers requests to a K2 reasoning layer (mocked locally) and enforces strict JSON contracts.

## Repository Structure

```
k2_math_tutor/
├─ backend/        # FastAPI application, SymPy validator, pytest suite
├─ frontend/       # Vite + React UI and Tailwind styling
├─ infra/          # Dockerfiles and docker-compose definition
├─ data/           # Sample problem set and grading rubrics
└─ README.md
```

## Prerequisites

- Python 3.11
- Node.js 18+ (LTS) and npm
- Docker Desktop (optional for container workflow)

## Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate           # Windows
# source .venv/bin/activate      # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env` with the runtime configuration:

```
K2_API_URL=http://localhost:8000/mock-k2
K2_API_KEY=dev-token
CORS_ORIGINS=http://localhost:5173
```

Run the development server (reloader ignores the virtualenv):

```bash
uvicorn app.main:app --reload --reload-exclude ".venv"
```

### Tests & Quality Gates

```bash
.venv\Scripts\python -m pytest
ruff check app tests
black --check app tests
```

## Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The dev servers assume:

- Frontend at http://localhost:5173
- Backend at http://localhost:8000

## Docker Workflow

Build and run both services with Docker Compose:

```bash
docker compose -f infra/docker-compose.yml up --build
```

Published ports:

- Backend → http://localhost:8000
- Frontend → http://localhost:5173

Compose injects:

- `K2_API_URL=http://backend:8000/mock-k2`
- `K2_API_KEY=dev-token`
- `VITE_API_BASE=http://backend:8000`

Override these values to point at a real K2 endpoint.(will be done in finals)

## API Endpoints

### `POST /api/solve`

Request:

```json
{
  "problem": "x + 5 = 7",
  "format": "plain",
  "level": "school",
  "need_alt": true
}
```

Response:

```json
{
  "steps": [
    { "expr": "x + 5 = 7", "explain": "Restate the original problem." }
  ],
  "final_answer": "x = 2",
  "validation": {
    "is_correct": true,
    "details": ["Solutions match expected result."]
  },
  "alts": [
    {
      "title": "Number line reasoning",
      "outline": [
        "Represent the equation on a number line",
        "Identify the shift required to balance both sides"
      ]
    }
  ],
  "timings_ms": { "k2": 120.5, "validate": 12.3 }
}
```

### `POST /api/explain`

```json
{
  "problem": "x + 5 = 7",
  "student_steps": ["x = 7 + 5"]
}
```

### `POST /api/validate`

```json
{
  "problem": "x + 5 = 7",
  "final_answer": "x = 2"
}
```

## Data Assets

- `data/samples.csv` – curated sample problems.
- `data/rubrics.json` – rubric descriptors for scoring.

## Using a Real K2 API

1. Update `K2_API_URL` to the real endpoint exposing `/solve_steps`, `/explain_misconception`, and `/generate_alt_method`.
2. Supply a valid `K2_API_KEY`.
3. Ensure the upstream service returns JSON that complies with the schemas built in `backend/app/services/prompt_builder.py`.

For local experimentation without credentials, rely on the built-in mock available under `/mock-k2`.

## Design Assets

High-fidelity UX mocks are stored in `docs/design/` (SVG sources plus PNG previews):

- Solve flow: [solve_v2.svg](docs/design/solve_v2.svg) ([PNG](docs/design/solve_v2.png))
- Explain flow: [explain_v2.svg](docs/design/explain_v2.svg) ([PNG](docs/design/explain_v2.png))
- Sandbox playground: [sandbox_v2.svg](docs/design/sandbox_v2.svg) ([PNG](docs/design/sandbox_v2.png))
