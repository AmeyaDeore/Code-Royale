import { validateHealthMetricPayload } from "../../../shared/schemas/healthMetric.schema.js";

export function createHealthRecord(input) {
  const validation = validateHealthMetricPayload(input);
  if (!validation.ok) {
    const err = new Error(validation.error);
    err.status = 400;
    throw err;
  }

  return {
    id: input.id || cryptoRandomId(),
    userId: input.userId,
    metricType: input.metricType,
    value: Number(input.value),
    unit: input.unit,
    source: input.source || "watch",
    recordedAt: new Date(input.recordedAt).toISOString(),
    createdAt: new Date().toISOString(),
  };
}

function cryptoRandomId() {
  return `hm_${Math.random().toString(36).slice(2, 11)}`;
}
