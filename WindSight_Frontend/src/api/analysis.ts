
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface AnalysisPoint {
  start_time: string;
  forecast_mw: number | null;
  actual_mw: number | null;
  error_mw: number | null;
  absolute_error_mw: number | null;
  forecast_publish_time: string | null;
}

export interface AnalysisMetrics {
  mae_mw: number | null;
  rmse_mw: number | null;
  bias_mw: number | null;
  max_absolute_error_mw: number | null;
  matched_intervals: number;
  missing_forecast_intervals: number;
  missing_actual_intervals: number;
}

export interface AnalysisResponse {
  delivery_date: string;
  decision_cutoff: string;
  metrics: AnalysisMetrics;
  points: AnalysisPoint[];
}

export async function fetchAnalysis(
  deliveryDate: string,
  decisionCutoff: string
): Promise<AnalysisResponse> {
  const params = new URLSearchParams({
    delivery_date: deliveryDate,
    decision_cutoff: decisionCutoff,
  });

  const response = await fetch(
    `${API_BASE_URL}/api/analysis?${params.toString()}`
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed (${response.status})`);
  }

  return (await response.json()) as AnalysisResponse;
}
