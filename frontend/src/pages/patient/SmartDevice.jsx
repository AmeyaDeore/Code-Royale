import { useEffect, useMemo, useState } from 'react';
import { Activity, Heart, Footprints, Wind, ShieldAlert, Watch } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';

const RANGE_OPTIONS = [
  { label: '15m', minutes: 15 },
  { label: '1h', minutes: 60 },
  { label: '3h', minutes: 180 },
  { label: 'All', minutes: 24 * 60 },
];

const SECONDARY_METRIC_OPTIONS = [
  { key: 'oxygenSaturation', label: 'Oxygen Saturation', shortLabel: 'SpO2', unit: '%' },
  { key: 'respiratoryRate', label: 'Respiratory Rate', shortLabel: 'Respiratory', unit: 'rpm' },
  { key: 'steps', label: 'Steps', shortLabel: 'Steps', unit: 'steps' },
];

const METRIC_COLORS = {
  steps: '#22C55E',
  oxygenSaturation: '#0EA5E9',
  respiratoryRate: '#F59E0B',
};

const now = Date.now();
const seedData = Array.from({ length: 36 }, (_, i) => {
  const timestamp = new Date(now - (35 - i) * 5 * 60 * 1000).toISOString();
  return {
    timestamp,
    heartRate: 68 + Math.round(Math.sin(i / 3) * 8 + (i % 5)),
    oxygenSaturation: 96 + ((i + 1) % 3),
    respiratoryRate: 14 + (i % 4),
    steps: 2300 + i * 140,
  };
});

function formatShortTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function normalizeRecords(payload) {
  const candidate =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.history) && payload.history) ||
    (Array.isArray(payload?.records) && payload.records) ||
    [];

  return candidate
    .map((item) => ({
      timestamp: item.timestamp || item.time || item.createdAt,
      heartRate: Number(item.heartRate ?? item.hr ?? 0),
      oxygenSaturation: Number(item.oxygenSaturation ?? item.spO2 ?? 0),
      respiratoryRate: Number(item.respiratoryRate ?? item.respRate ?? 0),
      steps: Number(item.steps ?? item.stepCount ?? 0),
    }))
    .filter((item) => item.timestamp)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const SmartDevice = () => {
  const [selectedRangeMin, setSelectedRangeMin] = useState(60);
  const [selectedSecondaryMetric, setSelectedSecondaryMetric] = useState('oxygenSaturation');
  const [alertThreshold, setAlertThreshold] = useState(120);
  const [history, setHistory] = useState(seedData);
  const [fetchStatus, setFetchStatus] = useState('Using sample wearable data');

  const connectUrl = import.meta.env.VITE_GOOGLE_FIT_CONNECT_URL || '#';
  const sourceLabel = import.meta.env.VITE_SMART_DEVICE_SOURCE_LABEL || 'Google Fit';
  const smartDeviceApiUrl = import.meta.env.VITE_SMART_DEVICE_API_URL;

  useEffect(() => {
    if (!smartDeviceApiUrl) return;

    const controller = new AbortController();

    const loadDeviceData = async () => {
      try {
        setFetchStatus('Fetching live wearable data...');
        const response = await fetch(smartDeviceApiUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = await response.json();
        const records = normalizeRecords(payload);
        if (records.length > 0) {
          setHistory(records);
          setFetchStatus('Live wearable data loaded');
        } else {
          setFetchStatus('No wearable records found, showing sample data');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setFetchStatus('Could not fetch wearable data, showing sample data');
        }
      }
    };

    loadDeviceData();

    return () => controller.abort();
  }, [smartDeviceApiUrl]);

  const latest = history.at(-1);
  const secondaryMetric = SECONDARY_METRIC_OPTIONS.find((option) => option.key === selectedSecondaryMetric);

  const rangeFilteredHistory = useMemo(() => {
    if (!history.length) return [];
    const thresholdMs = Date.now() - selectedRangeMin * 60 * 1000;
    return history.filter((item) => new Date(item.timestamp).getTime() >= thresholdMs);
  }, [history, selectedRangeMin]);

  const summary = useMemo(() => {
    if (!rangeFilteredHistory.length) {
      return { avgHeartRate: '--', maxHeartRate: '--', totalSteps: '--', records: 0 };
    }

    const totalHeartRate = rangeFilteredHistory.reduce((acc, row) => acc + row.heartRate, 0);
    const maxHeartRate = Math.max(...rangeFilteredHistory.map((row) => row.heartRate));
    const totalSteps = Math.max(...rangeFilteredHistory.map((row) => row.steps));

    return {
      avgHeartRate: Math.round(totalHeartRate / rangeFilteredHistory.length),
      maxHeartRate,
      totalSteps,
      records: rangeFilteredHistory.length,
    };
  }, [rangeFilteredHistory]);

  const shouldAlert = latest?.heartRate >= alertThreshold;
  const secondaryColor = METRIC_COLORS[selectedSecondaryMetric] || '#22C55E';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-textSecondary">Real-Time Health Monitor</p>
          <h1 className="text-2xl font-bold text-textPrimary">Smart Device</h1>
          <p className="text-textSecondary mt-1">Connect your wearable and monitor live vitals in one place.</p>
          <p className="text-xs text-textSecondary/80 mt-1">{fetchStatus}</p>
        </div>
        <a
          href={connectUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          <Watch className="w-4 h-4" />
          Connect Google Fit
        </a>
      </div>

      {shouldAlert ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 text-danger px-4 py-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          High heart rate alert: {latest.heartRate} bpm exceeds threshold {alertThreshold} bpm.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-white/10 bg-surface/40">
          <p className="text-textSecondary text-sm">Current Heart Rate</p>
          <p className="text-2xl mt-1 font-semibold text-textPrimary flex items-center gap-2"><Heart className="w-5 h-5 text-red-400" />{latest?.heartRate ?? '--'} bpm</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10 bg-surface/40">
          <p className="text-textSecondary text-sm">Current {secondaryMetric?.shortLabel}</p>
          <p className="text-2xl mt-1 font-semibold text-textPrimary flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" />{latest?.[selectedSecondaryMetric] ?? '--'} {secondaryMetric?.unit}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10 bg-surface/40">
          <p className="text-textSecondary text-sm">Total Steps</p>
          <p className="text-2xl mt-1 font-semibold text-textPrimary flex items-center gap-2"><Footprints className="w-5 h-5 text-yellow-400" />{summary.totalSteps}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10 bg-surface/40">
          <p className="text-textSecondary text-sm">Data Points</p>
          <p className="text-2xl mt-1 font-semibold text-textPrimary flex items-center gap-2"><Wind className="w-5 h-5 text-sky-400" />{summary.records}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary mb-3">Time Window</p>
          <div className="flex flex-wrap gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setSelectedRangeMin(option.minutes)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedRangeMin === option.minutes
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-textSecondary hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary mb-3">Secondary Metric</p>
          <div className="flex flex-wrap gap-2">
            {SECONDARY_METRIC_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedSecondaryMetric(option.key)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedSecondaryMetric === option.key
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-textSecondary hover:bg-white/10'
                }`}
              >
                {option.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-textSecondary">Alert Threshold</p>
            <p className="text-sm text-textPrimary">{alertThreshold} bpm</p>
          </div>
          <input
            type="range"
            min="90"
            max="170"
            step="5"
            value={alertThreshold}
            onChange={(event) => setAlertThreshold(Number(event.target.value))}
            className="w-full"
          />
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface/40 p-4 text-sm text-textSecondary space-y-1">
          <p>Data Source: {sourceLabel}</p>
          <p>Update Cadence: 15 seconds</p>
          <p>Visible Points: {rangeFilteredHistory.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Avg Heart Rate</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.avgHeartRate} <span className="text-sm text-textSecondary">bpm</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Max Heart Rate</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.maxHeartRate} <span className="text-sm text-textSecondary">bpm</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Total Steps</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.totalSteps} <span className="text-sm text-textSecondary">steps</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Records</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.records} <span className="text-sm text-textSecondary">pts</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <h3 className="text-textPrimary font-semibold mb-4">Heart Rate Timeline</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rangeFilteredHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="timestamp" tickFormatter={formatShortTime} stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" domain={[40, 180]} />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [`${value} bpm`, 'Heart Rate']}
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Line type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <h3 className="text-textPrimary font-semibold mb-4">{secondaryMetric?.label} Timeline</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rangeFilteredHistory}>
                <defs>
                  <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.75} />
                    <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="timestamp" tickFormatter={formatShortTime} stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [
                    `${value}${secondaryMetric?.unit ? ` ${secondaryMetric.unit}` : ''}`,
                    secondaryMetric?.label,
                  ]}
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey={selectedSecondaryMetric} stroke={secondaryColor} fill="url(#secondaryGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartDevice;