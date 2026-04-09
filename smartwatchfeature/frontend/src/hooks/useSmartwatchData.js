import { useCallback, useMemo, useState } from "react";
import { createSmartwatchApiClient } from "../api/smartwatchApiClient.js";

export function useSmartwatchData({ apiBaseUrl, userId, getAuthToken }) {
  const [latestMetrics, setLatestMetrics] = useState([]);
  const [historyMetrics, setHistoryMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const api = useMemo(
    () => createSmartwatchApiClient({ baseUrl: apiBaseUrl, getAuthToken }),
    [apiBaseUrl, getAuthToken]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [latest, history] = await Promise.all([
        api.getLatestMetrics(userId),
        api.getMetricHistory({ userId }),
      ]);
      setLatestMetrics(latest);
      setHistoryMetrics(history);
    } catch (err) {
      setError(err.message || "Unable to load smartwatch metrics");
    } finally {
      setLoading(false);
    }
  }, [api, userId]);

  const syncNow = useCallback(
    async (provider = "mock") => {
      setLoading(true);
      setError("");
      try {
        await api.syncMetrics({ userId, provider });
        await refresh();
      } catch (err) {
        setError(err.message || "Unable to sync metrics");
      } finally {
        setLoading(false);
      }
    },
    [api, refresh, userId]
  );

  return {
    latestMetrics,
    historyMetrics,
    loading,
    error,
    refresh,
    syncNow,
  };
}
