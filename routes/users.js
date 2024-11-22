var express = require('express');
var router = express.Router();
var userSchema = require('../model/user_model.js');
const Counter = require('../model/counter_model');
var tokenMiddleware = require('../middleware/token_middleware');
const bcrypt = require('bcrypt');

router.get('/', async function(req, res, next) {
  try {
    let user = await userSchema.find();
    return res.status(200).send({
      data: user,
      message: "Get all user successfully",
      successfully: true
    });
  } catch (error) {
    return res.status(500).send({
      data: error,
      message: "Server error",
      successfully: false
    })
  } 
});

router.get('/:id', async function(req, res, next) {
  try {
    let user = await userSchema.findById(req.params.id);

    if (!user) {
      return res.status(404).send({
        data: null,
        message: "User not found",
        successfully: false
      });
    }
    
    return res.status(200).send({
      data: user,
      message: "Get user by Id successfully",
      successfully: true
    });
  } catch (error) {
    return res.status(500).send({
      data: err,
      message: "Server error",
      successfully: false
    });
  }
});

router.post('/', async function(req, res, next){
  try {
    const counter = await Counter.findByIdAndUpdate(
      'userId',
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const userId = counter.sequence_value;

    let { username, password, age, gender } = req.body;

    const userAlready = await userSchema.findOne({ username: username});
    if (userAlready) {
      return res.status(400).send({
        data: null,
        message: "Username already exists",
        successfully: false
      });
    }

    let newUser = new userSchema({
      userId: userId,
      username: username,
      password: await bcrypt.hash(password, 10),
      age: age,
      gender: gender
    });

    let user = await newUser.save();
    return res.status(201).send({
      data: user,
      message: "Create user successfully",
      successfully: true
    });

  } catch (error) {
    return res.status(500).send({
      data: error,
      message: "Create user failed",
      successfully: false
    });
  }
});

router.put('/:id', tokenMiddleware, async function(req, res, next) {
  try {
    let  {password, age, gender} = req.body
    let { id } = req.params

    let userUpdate = await userSchema.findByIdAndUpdate(id, {
      password: await bcrypt.hash(password, 10),
      age: age,
      gender: gender
    }, {new: true});
    
    return res.status(200).send({
      data: userUpdate,
      message: "Update user successfully",
      successfully: true
    });

  } catch (error) {
    return res.status(500).send({
      data: error,
      message: "Update user failed",
      successfully: false
    });
  }
});

router.delete('/:id', tokenMiddleware, async function(req, res, next){
  try {
    let { id } = req.params
    let user = await userSchema.findByIdAndDelete(id);
    return res.status(200).send({
      data: user,
      message: "Delete user successfully",
      successfully: true
    });
  } catch (error) {
    return res.status(500).send({
      data: error,
      message: "Delete user failed",
      successfully: false
    })
  }
});

module.exports = router;
