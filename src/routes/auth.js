const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               university:
 *                 type: string
 *               course:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already exists
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[0-9]/),
  ],
  controller.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /api/auth/validate:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Validate a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Token is required
 *       401:
 *         description: Invalid token
 */
router.post('/validate', controller.validateToken);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Start Google OAuth sign-in
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 *       503:
 *         description: Google OAuth is not configured
 */
router.get('/google', controller.startGoogleAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Handle Google OAuth callback
 *     responses:
 *       302:
 *         description: Redirects to the frontend OAuth callback page
 *       503:
 *         description: Google OAuth is not configured
 */
router.get('/google/callback', controller.handleGoogleCallback);


module.exports = router;
