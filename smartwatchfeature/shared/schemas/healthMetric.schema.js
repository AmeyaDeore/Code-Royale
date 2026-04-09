import { METRIC_UNITS, SUPPORTED_METRIC_TYPES } from "../constants/metrics.js";

export function validateHealthMetricPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "payload must be an object" };
  }

  if (!payload.userId || typeof payload.userId !== "string") {
    return { ok: false, error: "userId must be a non-empty string" };
  }

  if (!SUPPORTED_METRIC_TYPES.includes(payload.metricType)) {
    return {
      ok: false,
      error: `metricType must be one of: ${SUPPORTED_METRIC_TYPES.join(", ")}`,
    };
  }

  if (!Number.isFinite(Number(payload.value))) {
    return { ok: false, error: "value must be a finite number" };
  }

  if (!payload.unit || payload.unit !== METRIC_UNITS[payload.metricType]) {
    return {
      ok: false,
      error: `unit must be '${METRIC_UNITS[payload.metricType]}' for metricType '${payload.metricType}'`,
    };
  }

  const date = new Date(payload.recordedAt);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "recordedAt must be a valid ISO date string" };
  }

  return { ok: true };
}
