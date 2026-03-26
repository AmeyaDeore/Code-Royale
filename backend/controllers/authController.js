import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import AppError from '../utils/appError.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
  'https://www.googleapis.com/auth/fitness.respiratory_rate.read',
];

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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return next(new AppError('Google OAuth is not configured on server', 500, 'GOOGLE_OAUTH_NOT_CONFIGURED'));
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_FIT_SCOPES.join(' '),
    });

    return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (error) {
    next(error);
  }
};

export const googleAuthCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code) {
      return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=failed&reason=missing_code`);
    }

    if (!clientId || !clientSecret || !redirectUri) {
      return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=failed&reason=server_config`);
    }

    const tokenBody = new URLSearchParams({
      code: String(code),
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=failed&reason=token_exchange`);
    }

    return res.redirect(`${frontendUrl}/patient/smart-device?googleFit=connected`);
  } catch (error) {
    next(error);
  }
};
