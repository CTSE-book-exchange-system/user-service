const express = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags:
 *       - Users
 *     summary: Search users
 *     parameters:
 *       - in: query
 *         name: university
 *         schema:
 *           type: string
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/search', controller.searchUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', controller.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update a user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               course:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: You can only update your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/users/{id}/saved-searches:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get saved searches for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saved searches fetched successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: You can only view your own saved searches
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id/saved-searches', authenticate, controller.getSavedSearches);

/**
 * @swagger
 * /api/users/{id}/saved-searches:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a saved search for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               moduleCode:
 *                 type: string
 *               keyword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Saved search created successfully
 *       400:
 *         description: Invalid saved search request
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: You can only create saved searches for your own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
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
