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
	res.status(StatusCodes.CREATED).json({ user:{
		email:user.email,
		lastName:user.lastName,
		location:user.location,
		name:user.name,
		token
	} });
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
	res.status(StatusCodes.OK).json({ user:{
		email:user.email,
		lastName:user.lastName,
		location:user.location,
		name:user.name,
		token
	} });
};

// Update user
const updateUser = async(req, res) => {
	const { body:{ email, name, lastName, location }, user:{ userId } } = req;
	// Check value
	if (!email || !name || !lastName || !location){
		throw new BadRequestError('Please provide all values !');
	}
	// User
	const user = await User.findOneAndUpdate({ _id:userId }, {
		name, lastName, location
	}, { new:true, runValidators:true });
	// Generate new token
	const token = user.createJWT();
	// Response
	res.status(StatusCodes.OK).json({ user:{
		email:user.email,
		lastName:user.lastName,
		location:user.location,
		name:user.name,
		token
	} });
};

// Exports
module.exports = { register, login, updateUser };