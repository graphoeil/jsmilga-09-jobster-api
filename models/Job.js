// Imports
const mongoose = require('mongoose');

// Job schema
const JobSchema = new mongoose.Schema({
	company:{
		type:String,
		required:[true, 'Please provide company name'],
		maxlength:50
	},
	position:{
		type:String,
		required:[true, 'Please provide position'],
		maxlength:100
	},
	status:{
		type:String,
		enum:['interview','declined','pending'],
		default:'pending'
	},
	jobType:{
		type:String,
		enum:['full-time','part-time','remote','internship'],
		default:'full-time'
	},
	jobLocation:{
		type:String,
		default:'Your city',
		required:true
	},
	createdBy:{
		type:mongoose.Types.ObjectId,
		ref:'User',
		required:[true, 'Please provide user']
	}
}, { timestamps:true });

// Export
module.exports = mongoose.model('Job', JobSchema);