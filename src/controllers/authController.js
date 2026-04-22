const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const { passport, isGoogleOAuthConfigured } = require('../config/passport');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      university: user.university,
      role: user.role || 'student',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

const logAuthError = (action, err) => {
  console.error(`[auth:${action}]`, {
    name: err?.name,
    message: err?.message,
    code: err?.code,
    detail: err?.detail,
    stack: err?.stack,
  });
};

const sendAuthServerError = (res) => {
  return res.status(500).json({
    success: false,
    error: 'Authentication service error',
    statusCode: 500,
  });
};

const buildFrontendRedirect = (path, params = {}) => {
  const url = new URL(path, frontendBaseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }

    const { name, email, password, university, course, year } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      university,
      course,
      year,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { token, user },
    });
  } catch (err) {
    logAuthError('register', err);
    return sendAuthServerError(res);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'This account uses Google sign-in. Please continue with Google.',
        statusCode: 401,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          university: user.university,
        },
      },
    });
  } catch (err) {
    logAuthError('login', err);
    return sendAuthServerError(res);
  }
};

exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required', statusCode: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ success: true, data: decoded, message: 'Token is valid' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token', statusCode: 401 });
  }
};

exports.startGoogleAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured',
      statusCode: 503,
    });
  }

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  })(req, res, next);
};

exports.handleGoogleCallback = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured',
      statusCode: 503,
    });
  }

  return passport.authenticate('google', { session: false }, (error, user) => {
    if (error || !user) {
      const failureUrl = buildFrontendRedirect('/oauth/callback', {
        error: error?.message || 'Google authentication failed',
      });
      return res.redirect(failureUrl);
    }

    const token = generateToken(user);
    const successUrl = buildFrontendRedirect('/oauth/callback', { token });

    return res.redirect(successUrl);
  })(req, res, next);
};
