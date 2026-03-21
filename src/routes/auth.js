const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');

const router = express.Router();

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

router.post('/login', controller.login);

router.post('/validate', controller.validateToken);

router.get('/google', controller.startGoogleAuth);

router.get('/google/callback', controller.handleGoogleCallback);


module.exports = router;
