const express = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/search', controller.searchUsers);
router.get('/:id', controller.getUserById);

router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().isLength({ min: 2 }),
    body('course').optional().isLength({ min: 2 }),
    body('year').optional().isInt({ min: 1, max: 10 }),
  ],
  controller.updateUser
);

router.get('/:id/saved-searches', authenticate, controller.getSavedSearches);

router.post(
  '/:id/saved-searches',
  authenticate,
  [
    body('moduleCode').optional().isLength({ min: 2 }),
    body('keyword').optional().isLength({ min: 2 }),
  ],
  controller.createSavedSearch
);

module.exports = router;
