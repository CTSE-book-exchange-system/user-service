const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');

const isOwner = (req) => req.user?.userId === req.params.id;

exports.getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    return res.json({
      success: true,
      data: user,
      message: 'User profile fetched successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      statusCode: 500,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array(),
        statusCode: 400,
      });
    }

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile',
        statusCode: 403,
      });
    }

    const existingUser = await userModel.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    const updatedUser = await userModel.updateUser(req.params.id, {
      name: req.body.name,
      course: req.body.course,
      year: req.body.year,
    });

    return res.json({
      success: true,
      data: updatedUser,
      message: 'User profile updated successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      statusCode: 500,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const users = await userModel.searchUsers({
      university: req.query.university,
      course: req.query.course,
    });

    return res.json({
      success: true,
      data: users,
      message: 'Users fetched successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      statusCode: 500,
    });
  }
};

exports.getSavedSearches = async (req, res) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own saved searches',
        statusCode: 403,
      });
    }

    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    const savedSearches = await userModel.getSavedSearches(req.params.id);

    return res.json({
      success: true,
      data: savedSearches,
      message: 'Saved searches fetched successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      statusCode: 500,
    });
  }
};

exports.createSavedSearch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array(),
        statusCode: 400,
      });
    }

    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        error: 'You can only create saved searches for your own account',
        statusCode: 403,
      });
    }

    const { moduleCode, keyword } = req.body;
    if (!moduleCode && !keyword) {
      return res.status(400).json({
        success: false,
        error: 'At least moduleCode or keyword is required',
        statusCode: 400,
      });
    }

    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });
    }

    const savedSearch = await userModel.createSavedSearch(req.params.id, moduleCode, keyword);

    return res.status(201).json({
      success: true,
      data: savedSearch,
      message: 'Saved search created successfully',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      statusCode: 500,
    });
  }
};
