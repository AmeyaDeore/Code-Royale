export function createInMemoryHealthRepository(seed = []) {
  const records = [...seed];

  return {
    async insert(record) {
      records.push(record);
      return record;
    },

    async findLatestByUser(userId) {
      const latestMap = new Map();
      for (const record of records) {
        if (record.userId !== userId) {
          continue;
        }

        const existing = latestMap.get(record.metricType);
        if (!existing || new Date(record.recordedAt) > new Date(existing.recordedAt)) {
          latestMap.set(record.metricType, record);
        }
      }

      return [...latestMap.values()];
    },

    async findHistory({ userId, metricType, from, to }) {
      return records
        .filter((item) => item.userId === userId)
        .filter((item) => (!metricType ? true : item.metricType === metricType))
        .filter((item) => (!from ? true : new Date(item.recordedAt) >= new Date(from)))
        .filter((item) => (!to ? true : new Date(item.recordedAt) <= new Date(to)))
        .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
    },
  };
}
