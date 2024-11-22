var express = require('express');
var router = express.Router();
var userSchema = require('../model/user_model.js')
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async function (req, res, next) {
    let credentials = req.body;
    
    if (!credentials.username || !credentials.password) {
        return res.status(400).send({
            success: false,
            message: 'unauthorized'
        });
    }

    try {
        let userFound = await userSchema
            .findOne({ username: credentials.username });
        console.log(userFound.role);
        
        if (!userFound) {
            return res.status(401).send({
                success: false,
                message: 'unauthorized'
            });
        }

        let password = await bcrypt.compare(
            credentials.password,
            userFound.password
        );

        if (!password) {
            return res.status(401).send({
                success: false,
                message: 'unauthorized'
            });
        }

        let token = jwt.sign(
            { 
                userId: userFound.userId, 
                username: userFound.username, 
                role: userFound.role 
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        let userData = {
            userId: userFound.userId,
            username: userFound.username,
            age: userFound.age,
            gender: userFound.gender,
            role: userFound.role,
            token: token
        };

        return res.status(200).send({
            success: true,
            data: userData
        });

    } catch (err) {
        return res.status(500).send({
            success: false,
            message: 'unauthorized'
        });
    }
});

module.exports = router;
