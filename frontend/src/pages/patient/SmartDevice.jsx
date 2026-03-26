import { useEffect, useMemo, useState } from 'react';
import { Activity, Heart, Footprints, Wind, ShieldAlert, Watch } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

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

function formatShortTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SmartDevice = () => {
  const { user } = useAuth();
  const [selectedRangeMin, setSelectedRangeMin] = useState(60);
  const [selectedSecondaryMetric, setSelectedSecondaryMetric] = useState('oxygenSaturation');
  const [alertThreshold, setAlertThreshold] = useState(120);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({ avgHeartRate: 0, maxHeartRate: 0, totalSteps: 0, records: 0 });
  const [fetchStatus, setFetchStatus] = useState('Preparing wearable sync...');
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const connectUrl = import.meta.env.VITE_GOOGLE_FIT_CONNECT_URL || `/api/auth/google?uid=${user?.id || ''}`;
  const sourceLabel = import.meta.env.VITE_SMART_DEVICE_SOURCE_LABEL || 'Google Fit';

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const defaultSummary = { avgHeartRate: 0, maxHeartRate: 0, totalSteps: 0, records: 0 };

    const fetchHistoryAndSummary = async () => {
      const [historyRes, summaryRes] = await Promise.all([
        api.get('/patient/smart-device/history?limit=240'),
        api.get('/patient/smart-device/summary/today'),
      ]);

      if (!isMounted) return;
      setHistory(historyRes.data.data || []);
      setSummary(summaryRes.data.data || defaultSummary);
      setLastSyncAt(new Date());
    };

    const fetchLive = async () => {
      try {
        const liveRes = await api.get('/patient/smart-device/live');
        const liveData = liveRes?.data?.data;
        if (liveData?.stale) {
          return {
            ok: false,
            message: liveData.note || 'No fresh Google Fit samples available. Showing last synced values.',
          };
        }
        return { ok: true };
      } catch (error) {
        const code = error.response?.data?.errorCode;
        if (code === 'GOOGLE_FIT_NOT_CONNECTED') {
          return { ok: false, message: 'Google Fit not connected. Click Connect Google Fit first.' };
        }
        return { ok: false, message: 'Unable to fetch fresh Google Fit data right now. Showing last synced values.' };
      }
    };

    const refreshDashboard = async (withLiveSync = true) => {
      if (!isMounted) return;

      setLoading(true);
      setFetchStatus(withLiveSync ? 'Fetching live wearable data...' : 'Refreshing smartwatch data...');

      let liveResult = { ok: true };
      if (withLiveSync) {
        liveResult = await fetchLive();
      }

      try {
        await fetchHistoryAndSummary();
      } catch (_error) {
        if (!isMounted) return;
        setHistory([]);
        setSummary(defaultSummary);
        setFetchStatus('Unable to load smartwatch history right now.');
        setLoading(false);
        return;
      }

      if (!isMounted) return;
      if (liveResult.ok) {
        setFetchStatus('Live Google Fit data synced');
      } else {
        setFetchStatus(liveResult.message);
      }
      setLoading(false);
    };

    const query = new URLSearchParams(window.location.search);
    const googleFitStatus = query.get('googleFit');
    if (googleFitStatus === 'connected') {
      setFetchStatus('Google Fit connected. Starting live sync...');
    }
    if (googleFitStatus === 'failed') {
      setFetchStatus('Google Fit connection failed. Please try connecting again.');
    }

    refreshDashboard(true);
    const intervalId = setInterval(() => refreshDashboard(true), 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user?.id]);

  const latest = history.at(-1);
  const secondaryMetric = SECONDARY_METRIC_OPTIONS.find((option) => option.key === selectedSecondaryMetric);

  const rangeFilteredHistory = useMemo(() => {
    if (!history.length) return [];
    const thresholdMs = Date.now() - selectedRangeMin * 60 * 1000;
    return history.filter((item) => new Date(item.timestamp).getTime() >= thresholdMs);
  }, [history, selectedRangeMin]);

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
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          <Watch className="w-4 h-4" />
          Connect Google Fit
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setFetchStatus('Fetching live wearable data...');
            try {
              await api.get('/patient/smart-device/live');
              const [historyRes, summaryRes] = await Promise.all([
                api.get('/patient/smart-device/history?limit=240'),
                api.get('/patient/smart-device/summary/today'),
              ]);
              setHistory(historyRes.data.data || []);
              setSummary(summaryRes.data.data || { avgHeartRate: 0, maxHeartRate: 0, totalSteps: 0, records: 0 });
              setLastSyncAt(new Date());
              setFetchStatus('Live Google Fit data synced');
            } catch (error) {
              const code = error.response?.data?.errorCode;
              setFetchStatus(
                code === 'GOOGLE_FIT_NOT_CONNECTED'
                  ? 'Google Fit not connected. Click Connect Google Fit first.'
                  : 'Unable to sync data right now. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Sync Now
        </button>

        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setFetchStatus('Refreshing smartwatch data...');
            try {
              const [historyRes, summaryRes] = await Promise.all([
                api.get('/patient/smart-device/history?limit=240'),
                api.get('/patient/smart-device/summary/today'),
              ]);
              setHistory(historyRes.data.data || []);
              setSummary(summaryRes.data.data || { avgHeartRate: 0, maxHeartRate: 0, totalSteps: 0, records: 0 });
              setLastSyncAt(new Date());
              setFetchStatus('Dashboard refreshed');
            } catch (_error) {
              setFetchStatus('Unable to refresh smartwatch data right now.');
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-textPrimary font-medium hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Refresh
        </button>

        <p className="text-xs text-textSecondary/80">
          {lastSyncAt ? `Last sync: ${lastSyncAt.toLocaleTimeString()}` : 'Last sync: not yet'}
        </p>
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
          <p className="text-2xl mt-1 font-semibold text-textPrimary flex items-center gap-2"><Footprints className="w-5 h-5 text-yellow-400" />{summary.totalSteps || 0}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-white/10 bg-surface/40">
          <p className="text-textSecondary text-sm">Data Points</p>
          <p className="text-2xl mt-1 font-semibold text-textPrimary flex items-center gap-2"><Wind className="w-5 h-5 text-sky-400" />{summary.records || 0}</p>
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
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.avgHeartRate || 0} <span className="text-sm text-textSecondary">bpm</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Max Heart Rate</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.maxHeartRate || 0} <span className="text-sm text-textSecondary">bpm</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Total Steps</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.totalSteps || 0} <span className="text-sm text-textSecondary">steps</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-surface/40 p-4">
          <p className="text-sm text-textSecondary">Records</p>
          <p className="text-xl font-semibold text-textPrimary mt-1">{summary.records || 0} <span className="text-sm text-textSecondary">pts</span></p>
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