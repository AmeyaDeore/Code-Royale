import { METRIC_TYPES, METRIC_UNITS } from "../../../shared/constants/metrics.js";
import { createHealthRecord } from "../models/HealthRecord.js";

export function createSmartwatchService({ repository, logger, config }) {
  return {
    async addMetric(payload) {
      const record = createHealthRecord(payload);
      return repository.insert(record);
    },

    async getLatestMetrics(userId) {
      if (!userId) {
        throw badRequest("userId is required");
      }

      return repository.findLatestByUser(userId);
    },

    async getMetricHistory(query) {
      if (!query.userId) {
        throw badRequest("userId is required");
      }

      return repository.findHistory(query);
    },

    async syncMetrics({ userId, provider }) {
      const resolvedUserId = userId || config.defaultUserId;
      const resolvedProvider = provider || config.defaultProvider;

      const generated = generateMockMetrics(resolvedUserId, resolvedProvider);
      for (const payload of generated) {
        await this.addMetric(payload);
      }

      logger.info?.(
        `[smartwatchfeature] synced ${generated.length} metrics for ${resolvedUserId} using ${resolvedProvider}`
      );

      return {
        syncedCount: generated.length,
        userId: resolvedUserId,
        provider: resolvedProvider,
      };
    },
  };
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function generateMockMetrics(userId, provider) {
  const now = Date.now();
  return [
    {
      userId,
      metricType: METRIC_TYPES.HEART_RATE,
      value: randomInt(60, 100),
      unit: METRIC_UNITS[METRIC_TYPES.HEART_RATE],
      source: provider,
      recordedAt: new Date(now - 60 * 1000).toISOString(),
    },
    {
      userId,
      metricType: METRIC_TYPES.STEPS,
      value: randomInt(1000, 12000),
      unit: METRIC_UNITS[METRIC_TYPES.STEPS],
      source: provider,
      recordedAt: new Date(now - 2 * 60 * 1000).toISOString(),
    },
    {
      userId,
      metricType: METRIC_TYPES.SLEEP_HOURS,
      value: Number((Math.random() * 3 + 5).toFixed(1)),
      unit: METRIC_UNITS[METRIC_TYPES.SLEEP_HOURS],
      source: provider,
      recordedAt: new Date(now - 3 * 60 * 1000).toISOString(),
    },
  ];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
