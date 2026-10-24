
import { useState,  type FormEvent } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Target,
  TrendingUp,
  Wind,
} from "lucide-react";

import { fetchAnalysis } from "./api/analysis";
import type { AnalysisResponse } from "./api/analysis";
import Header from "./components/Header";
import MetricCard from "./components/MetricCard";
import ForecastChart from "./components/ForecastChart";
import ResultsTable from "./components/ResultsTable";

const INITIAL_DATE = "2026-01-15";
const INITIAL_CUTOFF = "2026-01-14T12:00";

function formatMW(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toLocaleString("en-GB", {
    maximumFractionDigits: 1,
  })} MW`;
}

export default function App() {
  const [deliveryDate, setDeliveryDate] = useState(INITIAL_DATE);
  const [decisionCutoff, setDecisionCutoff] = useState(INITIAL_CUTOFF);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // The datetime input is explicitly interpreted as UTC.
      const cutoff = `${decisionCutoff}:00Z`;
      const result = await fetchAnalysis(deliveryDate, cutoff);
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the analysis. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const metrics = analysis?.metrics;

  return (
    <main className="app-shell">
      <Header />

      <section className="page-intro">
        <div>
          <p className="eyebrow">ENERGY TRADING ANALYTICS</p>
          <h2>Understand your wind forecast.</h2>
          <p className="intro-copy">
            Evaluate historical wind generation forecasts using only
            information available at the purchasing decision time.
          </p>
        </div>
        <div className="intro-mark">
          <Wind size={52} strokeWidth={1.2} />
        </div>
      </section>

      <section className="panel filter-panel">
        <div className="section-heading">
          <div>
            <h2>Analysis settings</h2>
            <p>Select a delivery day and the time the buying decision was made.</p>
          </div>
        </div>

        <form className="filters" onSubmit={runAnalysis}>
          <label className="field">
            <span>
              <CalendarDays size={15} />
              Delivery date
            </span>
            <input
              type="date"
              value={deliveryDate}
              min="2026-01-01"
              max="2026-01-31"
              required
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </label>

          <label className="field">
            <span>
              <Clock3 size={15} />
              Decision cutoff (UTC)
            </span>
            <input
              type="datetime-local"
              value={decisionCutoff}
              required
              onChange={(event) => setDecisionCutoff(event.target.value)}
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={17} className="spin" />
                Loading analysis...
              </>
            ) : (
              <>
                <BarChart3 size={17} />
                Run analysis
              </>
            )}
          </button>
        </form>

        <p className="timezone-note">
          All timestamps are interpreted as UTC. Select a cutoff no later
          than the purchasing decision time.
        </p>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Analysis failed</strong>
            <p>{error}</p>
            <p>
              Check that FastAPI is running and that the frontend can reach
              the backend.
            </p>
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <section className="welcome-panel">
          <div className="welcome-icon">
            <Target size={27} />
          </div>
          <h3>Ready to analyse</h3>
          <p>
            Run the analysis to load forecasts, actual generation and
            historical accuracy metrics from Elexon.
          </p>
        </section>
      )}

      {loading && (
        <div className="loading-panel">
          <RefreshCw size={23} className="spin" />
          <span>Fetching generation data and calculating accuracy...</span>
        </div>
      )}

      {analysis && metrics && !loading && (
        <>
          <div className="result-heading">
            <div>
              <p className="eyebrow">ANALYSIS RESULTS</p>
              <h2>
                {new Date(`${analysis.delivery_date}T00:00:00Z`).toLocaleDateString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )}
              </h2>
              <p>
                Decision cutoff:{" "}
                {new Date(analysis.decision_cutoff).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                })}{" "}
                UTC
              </p>
            </div>
            <div className="success-tag">
              <CheckCircle2 size={16} />
              Analysis loaded
            </div>
          </div>

          <section className="metrics-grid">
            <MetricCard
              label="Mean absolute error"
              value={formatMW(metrics.mae_mw)}
              description="Average absolute forecast error"
              icon={<Target size={19} />}
            />
            <MetricCard
              label="Root mean squared error"
              value={formatMW(metrics.rmse_mw)}
              description="Penalises larger errors"
              icon={<BarChart3 size={19} />}
            />
            <MetricCard
              label="Forecast bias"
              value={formatMW(metrics.bias_mw)}
              description={
                metrics.bias_mw == null
                  ? "Unavailable"
                  : metrics.bias_mw > 0
                    ? "Forecast overestimated actuals"
                    : metrics.bias_mw < 0
                      ? "Forecast underestimated actuals"
                      : "No average directional bias"
              }
              icon={<TrendingUp size={19} />}
            />
            <MetricCard
              label="Maximum absolute error"
              value={formatMW(metrics.max_absolute_error_mw)}
              description="Largest absolute interval error"
              icon={<Wind size={19} />}
            />
          </section>

          <section className="summary-strip">
            <div>
              <span className="summary-number">
                {metrics.matched_intervals}
              </span>
              <span className="summary-label">Matched intervals</span>
            </div>
            <div>
              <span className="summary-number">
                {metrics.missing_forecast_intervals}
              </span>
              <span className="summary-label">Reported missing forecasts</span>
            </div>
            <div>
              <span className="summary-number">
                {metrics.missing_actual_intervals}
              </span>
              <span className="summary-label">Missing actuals</span>
            </div>
          </section>

          {metrics.missing_forecast_intervals > 0 && (
            <p className="data-note">
              Forecasts are hourly while actuals are half-hourly. Some
              actual-only intervals may be counted as missing forecasts;
              interpret this count in light of the different data frequencies.
            </p>
          )}

          <ForecastChart points={analysis.points} />
          <ResultsTable points={analysis.points} />
        </>
      )}

      <footer className="app-footer">
        <span>WindSight · Historical forecast evaluation</span>
        <span>Data source: Elexon BMRS API</span>
      </footer>
    </main>
  );
}
