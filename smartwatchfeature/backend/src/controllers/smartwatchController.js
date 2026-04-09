export function createSmartwatchController({ service }) {
  return {
    getLatestMetrics: async (req, res, next) => {
      try {
        const data = await service.getLatestMetrics(req.query.userId);
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    },

    getMetricHistory: async (req, res, next) => {
      try {
        const data = await service.getMetricHistory({
          userId: req.query.userId,
          metricType: req.query.metricType,
          from: req.query.from,
          to: req.query.to,
        });
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    },

    addMetric: async (req, res, next) => {
      try {
        const data = await service.addMetric(req.body);
        res.status(201).json({ data });
      } catch (error) {
        next(error);
      }
    },

    syncMetrics: async (req, res, next) => {
      try {
        const data = await service.syncMetrics(req.body || {});
        res.status(200).json({ data });
      } catch (error) {
        next(error);
      }
    },
  };
}
