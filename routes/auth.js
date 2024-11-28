const express = require('express')
const router = express.Router()
const User = require('../model/user_model.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!isValidCredentials(username, password)) {
    return sendUnauthorizedResponse(res)
  }

  try {
    const user = await User.findOne({ username })
    
    if (!user) {
      return sendUnauthorizedResponse(res)
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return sendUnauthorizedResponse(res)
    }

    const token = generateToken(user)
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 })
    
    const userData = formatUserData(user, token)

    return res.status(200).json({
      success: true,
      data: userData
    })
  } catch (error) {
    return sendUnauthorizedResponse(res)
  }
})

// Helper functions
function isValidCredentials(username, password) {
  return username && password
}

function sendUnauthorizedResponse(res) {
  return res.status(401).json({
    success: false,
    message: 'unauthorized'
  })
}

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '24h' }
  );
}

function formatUserData(user, token) {
  return {
    userId: user.userId,
    username: user.username,
    age: user.age,
    gender: user.gender,
    role: user.role,
    token
  }
}

module.exports = router
