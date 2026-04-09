export function createDefaultConfig(env = process.env) {
  return {
    defaultProvider: env.SMARTWATCH_FEATURE_SYNC_PROVIDER || "mock",
    defaultUserId: env.SMARTWATCH_FEATURE_DEFAULT_USER_ID || "demo-user",
  };
}
