import { createDefaultConfig } from "./config/defaultConfig.js";
import { createInMemoryHealthRepository } from "./repositories/healthRepository.js";
import { createSmartwatchService } from "./services/smartwatchService.js";
import { createSmartwatchRouter } from "./routes/smartwatchRoutes.js";

export function createSmartwatchFeature(options = {}) {
  const config = options.config ?? createDefaultConfig();
  const repository = options.repository ?? createInMemoryHealthRepository();
  const logger = options.logger ?? console;
  const service = createSmartwatchService({ repository, logger, config });
  const router = createSmartwatchRouter({ service, logger });

  return {
    router,
    service,
    config,
  };
}
