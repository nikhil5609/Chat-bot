const express = require('express');
const { chatbox, getHistory, getSession, unauth_chatbot, deleteSession } = require('../Controller/model.controller');
const { body } = require('express-validator');
const modelRouter = express.Router();

modelRouter
    .post('/chat-bot',
        body('userPrompt').isLength({min: 1}),
        chatbox)
    .post('/unauth/chat-bot',
        body('userPrompt').isLength({min: 1}),
        unauth_chatbot)
    .post('/get-history',
        getHistory)
    .post('/get-session',
        getSession)
    .post('/delete-session',
        deleteSession
    )
module.exports = modelRouter;