const express = require('express');
const { createUser, loginUser, userToken, logoutUser } = require('../Controller/user.controller');
const { body } = require('express-validator');
const { verifyUser, verifyToken } = require('../middleware/verifyUser.midleware');
const userRouter = express.Router();

userRouter
    .post('/register',
        body('name').isLength({min: 3 , max: 20}),
        body('email').isEmail(),
        body('password').isLength({min: 3}),
        createUser)
    .post('/login',
        body('email').isEmail(),
        body('password').isLength({min: 3}),
        verifyUser,
        loginUser)
    .get('/verify-token',verifyToken,userToken)
    .get('/logout',verifyToken,logoutUser)

module.exports = userRouter