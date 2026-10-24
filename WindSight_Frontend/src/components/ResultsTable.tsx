
import type { AnalysisPoint } from "../api/analysis";

interface ResultsTableProps {
  points: AnalysisPoint[];
}

function formatMW(value: number | null) {
  return value == null
    ? "—"
    : value.toLocaleString("en-GB", {
        maximumFractionDigits: 2,
      });
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

export default function ResultsTable({ points }: ResultsTableProps) {
  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <div>
          <h2>Interval breakdown</h2>
          <p>{points.length} delivery intervals returned by the API</p>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Delivery time (UTC)</th>
              <th>Forecast (MW)</th>
              <th>Actual (MW)</th>
              <th>Error (MW)</th>
              <th>Forecast published (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.start_time}>
                <td className="timestamp">
                  {formatTimestamp(point.start_time)}
                </td>
                <td>{formatMW(point.forecast_mw)}</td>
                <td>{formatMW(point.actual_mw)}</td>
                <td>
                  {point.error_mw == null ? (
                    "—"
                  ) : (
                    <span
                      className={
                        point.error_mw > 0
                          ? "error-positive"
                          : point.error_mw < 0
                            ? "error-negative"
                            : ""
                      }
                    >
                      {point.error_mw > 0 ? "+" : ""}
                      {formatMW(point.error_mw)}
                    </span>
                  )}
                </td>
                <td className="timestamp">
                  {point.forecast_publish_time
                    ? formatTimestamp(point.forecast_publish_time)
                    : "—"}
                </td>
              </tr>
            ))}

            {points.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">
                  No intervals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
