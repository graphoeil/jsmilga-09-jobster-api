// Imports
const express = require('express');
const { register, login, updateUser } = require('../controllers/auth');
const authenticateUser = require('../middleware/authentication');
const testUser = require('../middleware/testUser');

// Router
const authRouter = express.Router();

// Rate limiter, to avoid someone spam our app !
const rateLimiter = require('express-rate-limit');
const apiLimiter = rateLimiter({
	windowMS:15 * 60 * 1000, // 15 minutes
	max:10, // 10 login / logout per 15 minutes
	message:{
		msg:'Too many requests from this IP, please try again after 15 minutes...'
	}
});

// Routes
authRouter.post('/register', apiLimiter, register);
authRouter.post('/login', apiLimiter, login);
authRouter.patch('/updateUser', authenticateUser, testUser, updateUser);

// Export
module.exports = authRouter;