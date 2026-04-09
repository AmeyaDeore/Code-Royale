import express from "express";
import { createSmartwatchController } from "../controllers/smartwatchController.js";

export function createSmartwatchRouter({ service, logger }) {
  const router = express.Router();
  const controller = createSmartwatchController({ service });

  router.get("/v1/metrics/latest", controller.getLatestMetrics);
  router.get("/v1/metrics/history", controller.getMetricHistory);
  router.post("/v1/metrics", controller.addMetric);
  router.post("/v1/sync", controller.syncMetrics);

  router.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) {
      logger.error?.("[smartwatchfeature] unexpected error", err);
    }

    res.status(status).json({
      error: {
        message: err.message || "Unexpected error",
        status,
      },
    });
  });

  return router;
}
