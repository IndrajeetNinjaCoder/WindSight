# WindSight — Wind Generation Forecast Analysis

WindSight is a full-stack web application that helps UK energy procurement teams evaluate wind power forecasts before day-ahead electricity purchasing decisions. It combines wind generation forecasts with actual generation data from Elexon and calculates quantitative forecast accuracy metrics.

## Overview

Wind generation depends on weather conditions, making it difficult to predict how much renewable electricity will be available on a given day. Energy procurement teams need to understand both the forecast available at decision time and how accurate that forecast is compared with actual generation.

WindSight addresses two key questions:

1. **What wind generation forecast was available at decision time?**
2. **How accurate was that forecast compared with actual wind generation?**

The application focuses on UK national-level wind generation data for January 2026, using Elexon as its sole data source.

## Features

- **Historical analysis:** Analyse a selected delivery date within January 2026.
- **Decision-time forecasts:** Select a decision cutoff and use only forecasts published on or before that cutoff.
- **Actual generation comparison:** Compare forecast generation against observed wind generation.
- **Forecast accuracy metrics:** Calculate MAE, RMSE, bias and maximum absolute error.
- **Time-series visualisation:** View forecast and actual generation over the delivery day.
- **Interval-level results:** Inspect forecast and actual values for individual delivery intervals.
- **Missing-data visibility:** Identify intervals without matching forecast or actual values.
- **Containerised backend:** Run the FastAPI service in Docker.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript |
| Backend | Python, FastAPI |
| Data processing | Pandas |
| API requests | HTTPX |
| Testing | Pytest |
| Containerisation | Docker |
| Data source | Elexon BMRS API |

## Data Sources

WindSight uses the following Elexon datasets:

### 1. Actual wind generation — FUELHH

Documentation: https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream

The application filters records to `fuelType = "WIND"` and uses:

- `startTime`: delivery interval timestamp.
- `generation`: actual wind generation.

FUELHH actual generation is represented at half-hourly resolution.

### 2. Wind generation forecasts — WINDFOR

Documentation: https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream

The application uses:

- `startTime`: target delivery interval.
- `publishTime`: time the forecast was published.
- `generation`: forecast wind generation.

Forecast publication timestamps are essential because a purchasing decision can only use information available at the time the decision is made.

## Forecast Selection and Accuracy Methodology

### Decision-time forecast selection

For a selected delivery date and decision cutoff, WindSight:

1. Retrieves the relevant forecast records from Elexon.
2. Filters forecasts to those published on or before the decision cutoff.
3. Groups eligible forecasts by delivery timestamp.
4. Selects the latest eligible publication for each delivery timestamp.
5. Compares the selected forecasts with actual generation.

Forecasts published after the decision cutoff are excluded to avoid using information that was unavailable when the purchasing decision had to be made.

### Accuracy metrics

Let \(F_i\) represent forecast generation and \(A_i\) represent actual generation for a matched interval. Define the error as \(e_i = F_i - A_i\).

**Mean Absolute Error (MAE)**

\[
MAE = \frac{1}{n}\sum_{i=1}^{n}|F_i-A_i|
\]

Measures the average magnitude of forecast errors in MW.

**Root Mean Squared Error (RMSE)**

\[
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)^2}
\]

Penalises larger errors more heavily than MAE.

**Forecast bias**

\[
Bias = \frac{1}{n}\sum_{i=1}^{n}(F_i-A_i)
\]

A positive bias indicates over-forecasting on average; a negative bias indicates under-forecasting.

**Maximum absolute error**

\[
MaxError = \max_i |F_i-A_i|
\]

Shows the largest absolute forecast error among matched intervals.

Metrics are calculated only for intervals with both forecast and actual values. If there are no matched intervals, the metrics are returned as unavailable rather than reporting misleading values.

### Time-resolution limitation

FUELHH actuals are half-hourly, while the WINDFOR response used by this application provides hourly forecasts. WindSight does not interpolate hourly forecasts or duplicate them into half-hourly intervals.

The delivery-day view retains the half-hourly actual timeline, and accuracy metrics use only timestamps where both datasets contain values. Missing forecast and actual intervals are reported separately so users can interpret coverage correctly.

## Project Structure

```text
WindSight/
├── WindSight_Backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── elexon.py
│   │       ├── forecast.py
│   │       └── analytics.py
│   ├── tests/
│   │   ├── test_analytics.py
│   │   └── test_forecast.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── pytest.ini
└── WindSight_Frontend/
    ├── src/
    │   ├── api/
    │   │   └── analysis.ts
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── MetricCard.tsx
    │   │   ├── ForecastChart.tsx
    │   │   └── ResultsTable.tsx
    │   └── App.tsx
    └── package.json
```

*The tree above reflects the expected project layout. Adjust the frontend folder and file names if your repository differs.*

### Backend responsibilities

- `main.py`: FastAPI application and API endpoints.
- `schemas.py`: Request and response data models.
- `services/elexon.py`: Fetches and processes Elexon data.
- `services/forecast.py`: Selects forecasts available at the decision cutoff.
- `services/analytics.py`: Aligns time intervals and calculates accuracy metrics.
- `tests/`: Tests for forecast selection and analytical calculations.
- `Dockerfile`: Defines the containerised backend environment.

### Frontend responsibilities

- `App.tsx`: Main application interface and analysis workflow.
- `api/analysis.ts`: Sends requests to the backend.
- `components/Header.tsx`: Application header.
- `components/MetricCard.tsx`: Displays accuracy metrics.
- `components/ForecastChart.tsx`: Visualises forecasts and actual generation.
- `components/ResultsTable.tsx`: Displays interval-level results.

## Getting Started

### Prerequisites

Install the following:

- Python 3.12 or compatible.
- Node.js and npm.
- Docker Desktop.
- Git.

### 1. Run the backend locally

Open PowerShell in the backend directory:

```powershell
cd WindSight_Backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

uvicorn app.main:app --reload
```

The API should be available at:

- API base URL: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

Keep this terminal open while using the application.

### 2. Run the frontend locally

Open a second terminal:

```powershell
cd WindSight_Frontend
npm install
npm run dev
```

Open the local URL printed by the frontend development server.

Configure the frontend API base URL to point to the running backend. If the frontend and backend use different origins, configure FastAPI CORS to allow the frontend's origin.

### 3. Run the backend with Docker

Ensure Docker Desktop is running, then execute:

```powershell
cd WindSight_Backend

docker build -t windsight-backend .
docker run --name windsight-api -p 8000:8000 windsight-backend
```

Access the API documentation at http://localhost:8000/docs.

To stop and remove the container:

```powershell
docker stop windsight-api
docker rm windsight-api
```

To rebuild after changing the backend:

```powershell
docker build -t windsight-backend .
```

The Docker image runs the FastAPI application using Uvicorn on port 8000.

### 4. Run tests

From the backend directory, activate the virtual environment if needed and run:

```powershell
pytest -q
```

The current test suite contains four tests covering forecast selection at a decision cutoff and analytics behaviour, including missing-data scenarios.

## Deployment

**Live application:** [Add your deployed frontend URL]

**Backend API:** [Add your deployed backend URL]

**Interactive API documentation:** [Add your deployed backend URL followed by `/docs`]

The frontend and backend must be configured to communicate using the deployed backend URL. Configure CORS for the deployed frontend origin and ensure the frontend's API base URL is correct.

The backend can be deployed using a Docker-compatible hosting service. The frontend can be deployed to Vercel or another static/frontend hosting platform.

## Assumptions and Limitations

- The analysis is restricted to delivery dates in January 2026.
- Elexon is the only data source used.
- Only national-level wind generation is considered.
- Forecast eligibility is determined by publication time, not by the most recent record regardless of cutoff.
- Accuracy metrics use matched forecast and actual timestamps only.
- Hourly forecasts are not artificially expanded to half-hourly intervals.
- This is a decision-support prototype, not an automated electricity trading system.
- Results depend on the availability and completeness of the upstream Elexon API.

## AI Tool Disclosure

AI tools were used to assist with development, including code drafting, debugging, test refinement, and documentation. The implementation and outputs should be validated against the requirements and the source API.

## Future Improvements

- Add additional renewable generation sources.
- Support forecast evaluation across multiple delivery dates.
- Provide forecast error distributions and time-of-day comparisons.
- Add automated data-quality and API availability monitoring.
- Improve deployment configuration and integration testing.

## License

This project was developed as a software engineering assignment. Add a licence if you intend to distribute or reuse the code publicly.
