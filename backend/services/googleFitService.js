import AppError from '../utils/appError.js';
import GoogleFitToken from '../models/GoogleFitToken.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_FIT_AGG_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate';

export const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
];

const LIVE_WINDOW_MS = 24 * 60 * 60 * 1000;
const LIVE_BUCKET_MS = 5 * 60 * 1000;

export const buildGoogleAuthUrl = (userId) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_FIT_SCOPES.join(' '),
    state: String(userId),
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const exchangeCodeForTokens = async (code) => {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new AppError('Google token exchange failed', 500, 'GOOGLE_TOKEN_EXCHANGE_FAILED');
  }

  return response.json();
};

const refreshAccessToken = async (refreshToken) => {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new AppError('Google token refresh failed', 401, 'GOOGLE_TOKEN_REFRESH_FAILED');
  }

  return response.json();
};

export const saveGoogleTokens = async ({ userId, accessToken, refreshToken, expiresIn }) => {
  if (!refreshToken) {
    const existing = await GoogleFitToken.findOne({ userId });
    refreshToken = existing?.refreshToken;
  }

  if (!refreshToken) {
    throw new AppError('Google refresh token missing', 500, 'GOOGLE_REFRESH_TOKEN_MISSING');
  }

  const tokenExpiryDate = new Date(Date.now() + (expiresIn || 3600) * 1000);

  await GoogleFitToken.findOneAndUpdate(
    { userId },
    {
      userId,
      accessToken,
      refreshToken,
      tokenExpiryDate,
    },
    { upsert: true, new: true }
  );
};

export const getValidAccessToken = async (userId) => {
  const tokenDoc = await GoogleFitToken.findOne({ userId });
  if (!tokenDoc) {
    throw new AppError('Google Fit is not connected for this account', 400, 'GOOGLE_FIT_NOT_CONNECTED');
  }

  const now = Date.now();
  const expiry = new Date(tokenDoc.tokenExpiryDate).getTime();

  if (expiry - now > 60 * 1000) {
    return tokenDoc.accessToken;
  }

  const refreshed = await refreshAccessToken(tokenDoc.refreshToken);
  tokenDoc.accessToken = refreshed.access_token;
  tokenDoc.tokenExpiryDate = new Date(now + (refreshed.expires_in || 3600) * 1000);
  await tokenDoc.save();

  return tokenDoc.accessToken;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const extractNumericValues = (value = {}) => {
  if (typeof value.intVal !== 'undefined' || typeof value.fpVal !== 'undefined') {
    return [toNumber(value.intVal ?? value.fpVal ?? 0)];
  }

  if (Array.isArray(value.mapVal)) {
    return value.mapVal.map((entry) => toNumber(entry?.value?.fpVal ?? entry?.value?.intVal ?? 0));
  }

  return [];
};

const getMetricKind = (dataset = {}, point = {}) => {
  const source = `${dataset.dataSourceId || ''} ${point.dataTypeName || ''}`.toLowerCase();

  if (source.includes('step_count')) return 'steps';
  if (source.includes('heart_rate') || source.includes('bpm')) return 'heartRate';
  if (source.includes('oxygen_saturation') || source.includes('spo2') || source.includes('oxygen')) return 'oxygenSaturation';
  if (source.includes('respiratory') || source.includes('breathing')) return 'respiratoryRate';

  return 'unknown';
};

const normalizeSpO2 = (rawValue) => {
  const safe = toNumber(rawValue);
  if (safe <= 0) return 0;
  return safe <= 1 ? Math.round(safe * 100) : Math.round(safe);
};

const parseAggregateResponse = (aggResponse = {}) => {
  let totalSteps = 0;
  const heartRatePoints = [];
  const oxygenPoints = [];
  const respiratoryRatePoints = [];
  let latestTimestampMs = 0;

  const buckets = Array.isArray(aggResponse.bucket) ? aggResponse.bucket : [];

  for (const bucket of buckets) {
    const bucketEndMs = toNumber(bucket.endTimeMillis);
    latestTimestampMs = Math.max(latestTimestampMs, bucketEndMs);

    const datasets = Array.isArray(bucket.dataset) ? bucket.dataset : [];
    for (const dataset of datasets) {
      const points = Array.isArray(dataset.point) ? dataset.point : [];

      for (const point of points) {
        const kind = getMetricKind(dataset, point);
        const values = Array.isArray(point.value) ? point.value : [];
        const pointTimestampMs = toNumber(point.endTimeNanos) / 1e6 || bucketEndMs;
        latestTimestampMs = Math.max(latestTimestampMs, pointTimestampMs);

        for (const value of values) {
          const numericValues = extractNumericValues(value);

          if (kind === 'steps') {
            totalSteps += numericValues.reduce((sum, current) => sum + current, 0);
          }

          if (kind === 'heartRate') {
            for (const current of numericValues) {
              const hr = toNumber(current);
              if (hr > 0) heartRatePoints.push({ value: hr, timestamp: pointTimestampMs });
            }
          }

          if (kind === 'oxygenSaturation') {
            for (const current of numericValues) {
              const spO2 = normalizeSpO2(current);
              if (spO2 > 0) oxygenPoints.push({ value: spO2, timestamp: pointTimestampMs });
            }
          }

          if (kind === 'respiratoryRate') {
            for (const current of numericValues) {
              const rr = toNumber(current);
              if (rr > 0) respiratoryRatePoints.push({ value: rr, timestamp: pointTimestampMs });
            }
          }
        }
      }
    }
  }

  const latestHeartRate = heartRatePoints.length
    ? heartRatePoints.reduce((latest, curr) => (curr.timestamp > latest.timestamp ? curr : latest)).value
    : 0;

  const avgHeartRate = heartRatePoints.length
    ? Math.round(heartRatePoints.reduce((sum, item) => sum + item.value, 0) / heartRatePoints.length)
    : 0;

  const latestSpO2 = oxygenPoints.length
    ? oxygenPoints.reduce((latest, curr) => (curr.timestamp > latest.timestamp ? curr : latest)).value
    : 0;

  const latestRespiratoryRate = respiratoryRatePoints.length
    ? respiratoryRatePoints.reduce((latest, curr) => (curr.timestamp > latest.timestamp ? curr : latest)).value
    : 0;

  return {
    heartRate: latestHeartRate || avgHeartRate,
    steps: Math.max(0, Math.round(totalSteps)),
    oxygenSaturation: Math.max(0, Math.round(latestSpO2)),
    respiratoryRate: Math.max(0, Math.round(latestRespiratoryRate)),
    timestamp: latestTimestampMs ? new Date(latestTimestampMs) : new Date(Date.now()),
  };
};

export const fetchGoogleFitData = async (accessToken) => {
  const endTimeMillis = Date.now();
  const startTimeMillis = endTimeMillis - LIVE_WINDOW_MS;

  const runAggregate = async (aggregateBy) => {
    const body = {
      aggregateBy,
      bucketByTime: { durationMillis: LIVE_BUCKET_MS },
      startTimeMillis,
      endTimeMillis,
    };

    const response = await fetch(GOOGLE_FIT_AGG_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  const fullAggregate = [
    { dataTypeName: 'com.google.step_count.delta' },
    { dataTypeName: 'com.google.heart_rate.bpm' },
    { dataTypeName: 'com.google.oxygen_saturation' },
    { dataTypeName: 'com.google.respiratory_rate' },
  ];

  const fallbackAggregate = [
    { dataTypeName: 'com.google.step_count.delta' },
    { dataTypeName: 'com.google.heart_rate.bpm' },
  ];

  // Some accounts/devices do not expose all advanced Google Fit data types.
  const payload = (await runAggregate(fullAggregate)) || (await runAggregate(fallbackAggregate));
  if (!payload) {
    throw new AppError('Failed to fetch Google Fit data', 502, 'GOOGLE_FIT_FETCH_FAILED');
  }

  return parseAggregateResponse(payload);
};