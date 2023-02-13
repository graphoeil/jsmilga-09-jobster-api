// Imports
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User schema
const UserSchema = new mongoose.Schema({
	name:{
		type:String,
		required:[true, 'Please provide name'],
		trim:true,
		minlength:3,
		maxlength:50
	},
	lastName:{
		type:String,
		trim:true,
		maxlength:30,
		default:'Your lastname'
	},
	location:{
		type:String,
		trim:true,
		maxlength:30,
		default:'Your city'
	},
	email:{
		type:String,
		required:[true, 'Please provide email'],
		match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide valid email'],
		unique:true
	},
	password:{
		type:String,
		required:[true, 'Please provide password'],
		minlength:6
	}
});

// Pre
UserSchema.pre('save', async function(next){
	// Salt
	const salt = await bcrypt.genSalt(10);
	// Password
	this.password = await bcrypt.hash(this.password, salt);
	// Next
	next();
});

// Instances methods
UserSchema.methods.getName = function(){
	return this.name;
};
UserSchema.methods.createJWT = function(){
	return jwt.sign({ userId:this._id, name:this.name }, process.env.JWT_SECRET, {
		expiresIn:process.env.JWT_LIFETIME
	});
};
UserSchema.methods.comparePassword = async function(candidatePassword){
	const isMatch = await bcrypt.compare(candidatePassword, this.password);
	return isMatch;
};

// Export
module.exports = mongoose.model('User', UserSchema);