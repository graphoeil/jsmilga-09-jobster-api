// Imports
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

// Check if user is authenticated
const auth = async(req, res, next) => {
	// Authorization header
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer')){
		throw new UnauthenticatedError('Authentication invalid !');
	}
	// Token
	const token = authHeader.split(' ')[1];
	// Is token valid ?
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		// Test if user is demo - Restrict access for CRUD => Read only !
		// We pass the id of the demo user, got it in mongoDB
		// We will restrict demo user CRUD functionality
		// in the auth and jobs routes with testUser middleware
		const testUser = payload.userId === '63e4dee73ee6980af0f9a187';
		// Attach user to the request
		req.user = { userId:payload.userId, testUser };
	} catch (error){
		throw new UnauthenticatedError('Authentication invalid !');
	}
	// Next
	next();
};

// Export
module.exports = auth;