
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalysisPoint } from "../api/analysis";

interface ForecastChartProps {
  points: AnalysisPoint[];
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function ForecastChart({ points }: ForecastChartProps) {
  const chartData = points.map((point) => ({
    ...point,
    time: formatTime(point.start_time),
  }));

  return (
    <section className="panel chart-panel">
      <div className="section-heading">
        <div>
          <h2>Forecast vs actual generation</h2>
          <p>National wind generation · MW · timestamps in UTC</p>
        </div>
        <span className="chart-unit">MW</span>
      </div>

      {points.length === 0 ? (
        <div className="empty-state">No data available for this selection.</div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 18, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7ece9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                interval={3}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                width={66}
                tickFormatter={(value: number) =>
                  `${Math.round(value / 1000)}k`
                }
              />
              <Tooltip
                labelFormatter={(label) => `${label} UTC`}
                formatter={(value, name) => [
                  value == null
                    ? "No value"
                    : `${Number(value).toLocaleString()} MW`,
                  name === "forecast_mw" ? "Forecast" : "Actual",
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "forecast_mw" ? "Forecast" : "Actual"
                }
              />
              <Line
                type="monotone"
                dataKey="forecast_mw"
                name="forecast_mw"
                stroke="#16836b"
                strokeWidth={2.5}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="actual_mw"
                name="actual_mw"
                stroke="#e39b42"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="chart-note">
        Forecasts are hourly; actuals are available every 30 minutes. Missing
        forecast values at half-hour timestamps are intentional.
      </p>
    </section>
  );
}
