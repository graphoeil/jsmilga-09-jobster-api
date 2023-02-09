// Imports
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

// Register user
const register = async(req, res) => {
	// Create user
	const user = await User.create({ ...req.body });
	// JWT Token
	const token = user.createJWT();
	// Response
	res.status(StatusCodes.CREATED).json({ user:{ name:user.name }, token });
};

// Login
const login = async(req, res) => {
	const { email, password } = req.body;
	// Check if email and password
	if (!email || !password){
		throw new BadRequestError('Please provide email and password...');
	}
	// Check for the user in mongoDB
	const user  = await User.findOne({ email });
	if (!user){
		throw new UnauthenticatedError('Invalid credentials !');
	}
	// Compare password
	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect){
		throw new UnauthenticatedError('Invalid credentials !');
	}
	// JWT Token
	const token = user.createJWT();
	// Response
	res.status(StatusCodes.OK).json({ user:{ name:user.name }, token });
};

// Exports
module.exports = { register, login };