import User from '../models/User.js';
import HealthData from '../models/HealthData.js';
import AppError from '../utils/appError.js';
import { fetchGoogleFitData, getValidAccessToken } from '../services/googleFitService.js';

const toSmartDeviceRow = (entry) => ({
  timestamp: entry.date || entry.createdAt,
  heartRate: entry.metrics?.heartRate || 0,
  oxygenSaturation: entry.metrics?.oxygenSaturation || 0,
  respiratoryRate: entry.metrics?.respiratoryRate || 0,
  steps: entry.metrics?.steps || 0,
});

const hasAnyMetricValue = (metrics = {}) => {
  const values = [
    Number(metrics.heartRate || 0),
    Number(metrics.oxygenSaturation || 0),
    Number(metrics.respiratoryRate || 0),
    Number(metrics.steps || 0),
  ];

  return values.some((value) => Number.isFinite(value) && value > 0);
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }
  } catch (error) {
    next(error);
  }
};

export const getHealthData = async (req, res, next) => {
  try {
    const data = await HealthData.find({ patientId: req.user._id }).sort({ date: -1 });
    res.json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createHealthData = async (req, res, next) => {
  try {
    const { metrics, aiHealthScore } = req.body;

    const data = await HealthData.create({
      patientId: req.user._id,
      metrics,
      aiHealthScore,
    });

    res.status(201).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSmartDeviceLiveData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const accessToken = await getValidAccessToken(userId);
    const live = await fetchGoogleFitData(accessToken);

    const liveMetrics = {
      heartRate: live.heartRate,
      oxygenSaturation: live.oxygenSaturation,
      respiratoryRate: live.respiratoryRate,
      steps: live.steps,
    };

    if (!hasAnyMetricValue(liveMetrics)) {
      const fallback = await HealthData.findOne({
        patientId: userId,
        source: 'googlefit',
        $or: [
          { 'metrics.heartRate': { $gt: 0 } },
          { 'metrics.oxygenSaturation': { $gt: 0 } },
          { 'metrics.respiratoryRate': { $gt: 0 } },
          { 'metrics.steps': { $gt: 0 } },
        ],
      }).sort({ date: -1 });

      if (fallback) {
        return res.json({
          status: 'success',
          data: {
            ...toSmartDeviceRow(fallback),
            stale: true,
            note: 'No fresh Google Fit samples were returned; showing last available synced sample.',
          },
        });
      }
    }

    const saved = await HealthData.create({
      patientId: userId,
      date: live.timestamp,
      metrics: liveMetrics,
      source: 'googlefit',
    });

    res.json({
      status: 'success',
      data: toSmartDeviceRow(saved),
    });
  } catch (error) {
    next(error);
  }
};

export const getSmartDeviceHistory = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 120);
    const entries = await HealthData.find({ patientId: req.user._id, source: 'googlefit' })
      .sort({ date: -1 })
      .limit(limit);

    const cleaned = entries
      .reverse()
      .map(toSmartDeviceRow)
      .filter((row) => hasAnyMetricValue(row));

    res.json({
      status: 'success',
      data: cleaned,
    });
  } catch (error) {
    next(error);
  }
};

export const getSmartDeviceTodaySummary = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const entries = await HealthData.find({
      patientId: req.user._id,
      source: 'googlefit',
      date: { $gte: start },
    }).sort({ date: 1 });

    if (!entries.length) {
      return res.json({
        status: 'success',
        data: {
          avgHeartRate: 0,
          maxHeartRate: 0,
          totalSteps: 0,
          records: 0,
        },
      });
    }

    const rates = entries.map((entry) => entry.metrics?.heartRate || 0).filter((value) => value > 0);
    const avgHeartRate = rates.length
      ? Math.round(rates.reduce((sum, value) => sum + value, 0) / rates.length)
      : 0;
    const maxHeartRate = rates.length ? Math.max(...rates) : 0;

    const totalSteps = entries.reduce(
      (maxSteps, entry) => Math.max(maxSteps, Number(entry.metrics?.steps || 0)),
      0
    );

    return res.json({
      status: 'success',
      data: {
        avgHeartRate,
        maxHeartRate,
        totalSteps,
        records: entries.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
