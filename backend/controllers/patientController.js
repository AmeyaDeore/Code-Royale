import User from '../models/User.js';
import HealthData from '../models/HealthData.js';
import AppError from '../utils/appError.js';

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
