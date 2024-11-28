const express = require('express')
const router = express.Router()
const User = require('../model/user_model.js')
const Counter = require('../model/counter_model')
const tokenMiddleware = require('../middleware/token_middleware')
const bcrypt = require('bcrypt')

// Get all users (admin only)
router.get('/', tokenMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Not permission',
        success: false
      })
    }

    const users = await User.find()
    return res.status(200).json({
      data: users,
      message: 'Get all users successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Server error',
      success: false
    })
  }
})

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        success: false
      })
    }
    
    return res.status(200).json({
      data: user,
      message: 'Get user by Id successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Server error',
      success: false
    })
  }
})

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, email, age, gender, role = 'user' } = req.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        message: 'Username already exists',
        success: false
      })
    }

    const userId = await generateUserId()
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      userId,
      username,
      password: hashedPassword,
      email,
      age,
      gender,
      role
    })

    const savedUser = await newUser.save()
    return res.status(201).json({
      data: savedUser,
      message: 'Create user successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Create user failed',
      success: false
    })
  }
})

// Update user
router.put('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { password, age, gender, email} = req.body
    const { id } = req.params

    const hashedPassword = await bcrypt.hash(password, 10)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        age,
        gender,
        email
      },
      { new: true }
    )
    
    return res.status(200).json({
      data: updatedUser,
      message: 'Update user successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Update user failed',
      success: false
    })
  }
})

// Delete user
router.delete('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const deletedUser = await User.findByIdAndDelete(id)
    
    return res.status(200).json({
      data: deletedUser,
      message: 'Delete user successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Delete user failed',
      success: false
    })
  }
})

// Helper function
async function generateUserId() {
  const userCount = await User.countDocuments()
  
  if (userCount === 0) {
    await Counter.findByIdAndUpdate(
      'userId',
      { sequence_value: 0 },
      { new: true, upsert: true }
    )
  }

  const counter = await Counter.findByIdAndUpdate(
    'userId',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
  
  return `ID-${counter.sequence_value}`
}

module.exports = router
