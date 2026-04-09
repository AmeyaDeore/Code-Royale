export function createSmartwatchApiClient({ baseUrl, fetchImpl = fetch, getAuthToken }) {
  if (!baseUrl) {
    throw new Error("smartwatch api baseUrl is required");
  }

  const request = async (path, options = {}) => {
    const token = getAuthToken ? await getAuthToken() : null;
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || `Request failed with status ${response.status}`);
    }

    return data.data;
  };

  return {
    getLatestMetrics(userId) {
      return request(`/v1/metrics/latest?userId=${encodeURIComponent(userId)}`);
    },

    getMetricHistory({ userId, metricType, from, to }) {
      const params = new URLSearchParams({ userId });
      if (metricType) params.set("metricType", metricType);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      return request(`/v1/metrics/history?${params.toString()}`);
    },

    addMetric(payload) {
      return request("/v1/metrics", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    syncMetrics(payload) {
      return request("/v1/sync", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  };
}
