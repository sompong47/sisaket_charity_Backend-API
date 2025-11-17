const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST - Create or update user from Google login
router.post('/', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (user) {
      // Update existing user
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        lastLogin: new Date()
      });
    }

    res.json({
      success: true,
      message: 'User logged in successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ lastLogin: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;