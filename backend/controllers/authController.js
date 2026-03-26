import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import AppError from '../utils/appError.js';
import { buildGoogleAuthUrl, exchangeCodeForTokens, saveGoogleTokens } from '../services/googleFitService.js';

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new AppError('User already exists', 400, 'USER_EXISTS'));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
    });

    if (user) {
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      return next(new AppError('Invalid user data', 400, 'INVALID_USER_DATA'));
    }
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }
  } catch (error) {
    next(error);
  }
};

export const startGoogleAuth = async (req, res, next) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return next(new AppError('Missing uid for Google OAuth connect flow', 400, 'MISSING_UID'));
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return next(new AppError('Google OAuth is not configured on server', 500, 'GOOGLE_OAUTH_NOT_CONFIGURED'));
    }

    return res.redirect(buildGoogleAuthUrl(uid));
  } catch (error) {
    next(error);
  }
};

export const googleAuthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=failed&reason=missing_code_or_state`);
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=failed&reason=server_config`);
    }

    const tokens = await exchangeCodeForTokens(String(code));

    await saveGoogleTokens({
      userId: String(state),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });

    return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=connected`);
  } catch (error) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/smart-device?googleFit=failed&reason=token_exchange`);
  }
};
