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
		// Attach user to the request
		req.user = { userId:payload.userId, name:payload.name };
	} catch (error){
		throw new UnauthenticatedError('Authentication invalid !');
	}
	// Next
	next();
};

// Export
module.exports = auth;