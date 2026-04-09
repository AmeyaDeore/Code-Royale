export const METRIC_TYPES = {
  HEART_RATE: "heart_rate",
  STEPS: "steps",
  SLEEP_HOURS: "sleep_hours",
  CALORIES: "calories",
};

export const METRIC_UNITS = {
  [METRIC_TYPES.HEART_RATE]: "bpm",
  [METRIC_TYPES.STEPS]: "steps",
  [METRIC_TYPES.SLEEP_HOURS]: "hours",
  [METRIC_TYPES.CALORIES]: "kcal",
};

export const SUPPORTED_METRIC_TYPES = Object.values(METRIC_TYPES);
