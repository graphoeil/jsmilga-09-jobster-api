// Imports
const moment = require('moment');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// !!!! Mongoose latest version => v6
// If an option passed to getAllJobs is not in the model (models/Jobs.js)
// then mongoose no longer return nothing but return the complete list of jobs !!!!

// Get all jobs
const getAllJobs = async(req, res) => {
	// http://localhost:5000/api/v1/jobs?status=all&jobType=all&sort=latest&page=1
	// req.query => { status: 'all', jobType: 'all', sort: 'latest', page: '1' }
	// Query data
	const { search, status, jobType, sort } = req.query;
	// Query object, we pass the query object to Job.find !
	const queryObject = {
		createdBy: req.user.userId
	};
	// Search => 'i' => case insensitive
	if (search){
		queryObject.position = { $regex:search, $options:'i' };
	}
	// Other conditions
	if (status && status !== 'all'){
		queryObject.status = status;
	}
	if (jobType && jobType !== 'all'){
		queryObject.jobType = jobType;
	}
	// Result without sorting
	let result = Job.find(queryObject);
	// Sorting
	if (sort === 'lastest'){
		result = result.sort('-createdAt');
	}
	if (sort === 'oldest'){
		result = result.sort('createdAt');
	}
	if (sort === 'a-z'){
		result = result.sort('position');
	}
	if (sort === 'z-a'){
		result = result.sort('-position');
	}
	// Pagination
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * limit; // 1 - 1 = 0; 0 * 10 = 0 etc...
	result = result.skip(skip).limit(limit);
	// Jobs
	const jobs = await result;
	// Total jobs and number of pages
	const totalJobs = await Job.countDocuments(queryObject);
	const numOfPages = Math.ceil(totalJobs / limit);
	// Response
	res.status(StatusCodes.OK).json({ totalJobs, jobs, numOfPages });
};

// Get single job
const getJob = async(req, res) => {
	// Get jobId and userId
	const { user:{ userId }, params:{ id:jobId } } = req;
	// Job
	const job = await Job.findOne({ _id:jobId, createdBy:userId });
	// Job exist ?
	if (!job){
		throw new NotFoundError(`No job with id ${ jobId }`);
	}
	// Response
	res.status(StatusCodes.OK).json({ job });
};

// Create job
const createJob = async(req, res) => {
	// Add userId to req.body
	req.body.createdBy = req.user.userId;
	// Create job in mongoDB
	const job = await Job.create(req.body);
	// Response
	res.status(StatusCodes.CREATED).json({ job });
};

// Update job
const updateJob = async(req, res) => {
	// Get jobId and userId
	const { user:{ userId }, params:{ id:jobId }, 
		body:{ company, position } } = req;
	// Check company and position
	if (!company || !position){
		throw new BadRequestError('Company or position fields cannot be empty...');
	}
	// Update
	const job = await Job.findOneAndUpdate({ _id:jobId, createdBy:userId }, req.body, 
		{ new:true, runValidators:true });
	// Job exist ?
	if (!job){
		throw new NotFoundError(`No job with id ${ jobId }`);
	}
	// Response
	res.status(StatusCodes.OK).json({ job });
};

// Delete job
const deleteJob = async(req, res) => {
	// Get job and userId
	const { user:{ userId }, params:{ id:jobId } } = req;
	// Delete
	const job = await Job.findOneAndDelete({ _id:jobId, createdBy:userId });
	// Job exist ?
	if (!job){
		throw new NotFoundError(`No job with id ${ jobId }`);
	}
	// Response
	res.status(StatusCodes.OK).send();
};

// Stats
const showStats = async(req, res) => {
	// userId
	const { user:{ userId } } = req;
	////////////////////////////////////////// Defaults stats
	// Get stats with aggregate from mongoDB
	let stats = await Job.aggregate([
		// Get job created by user => userId
		{ $match:{ createdBy:mongoose.Types.ObjectId(userId) } },
		// Group them by status and sum them starting at 1
		{ $group:{ _id:'$status', count:{ $sum:1 } } }
	]);
	/* stats :
	[
	{ _id: 'pending', count: 30 },
	{ _id: 'declined', count: 20 },
	{ _id: 'interview', count: 25 }
	] */
	// Convert stats array into an object
	stats = stats.reduce((acc, curr) => {
		const { _id:title, count } = curr;
		acc[title] = count;
		return acc;
	}, {});
	// => { interview: 25, pending: 30, declined: 20 }
	// Defaults stats
	const defaultStats = {
		pending:stats.pending || 0,
		declined:stats.declined || 0,
		interview:stats.interview || 0
	};
	////////////////////////////////////////// Monthly applications
	let monthlyApplications = await Job.aggregate([
		// Get job created by user => userId
		{ $match:{ createdBy:mongoose.Types.ObjectId(userId) } },
		// Group them by year and month
		// MongoDB can get the year and month from $createdAt (magic !)
		{ $group:{
			_id:{ year:{ $year:'$createdAt' }, month:{ $month:'$createdAt' } },
			count:{ $sum:1 }
		} },
		// Sort, don't forget id an object and year, month => properties ;-)
		{ $sort:{ '_id.year':-1, '_id.month':-1 } },
		// Last 6 months
		{ $limit:6 }
	]);
	/* monthlyApplications :
	[
	{ _id: { year: 2023, month: 2 }, count: 2 },
	{ _id: { year: 2023, month: 1 }, count: 9 },
	{ _id: { year: 2022, month: 12 }, count: 7 },
	{ _id: { year: 2022, month: 11 }, count: 6 },
	{ _id: { year: 2022, month: 10 }, count: 6 },
	{ _id: { year: 2022, month: 9 }, count: 6 }
	] */
	monthlyApplications = monthlyApplications.map((item) => {
		const { _id:{ year, month }, count } = item;
		// month - 1, because moment treats months differently 
		const date = moment().month(month - 1).year(year).format('MMM Y');
		return { date, count };
	}).reverse();
	/* [
	{ date: 'Sep 2022', count: 6 },
	{ date: 'Oct 2022', count: 6 },
	{ date: 'Nov 2022', count: 6 },
	{ date: 'Dec 2022', count: 7 },
	{ date: 'Jan 2023', count: 9 },
	{ date: 'Feb 2023', count: 2 }
	] */
	// Response
	res.status(StatusCodes.OK).json({
		defaultStats,
		monthlyApplications
	});
};

// Exports
module.exports = {
	getAllJobs,
	getJob,
	createJob,
	updateJob,
	deleteJob,
	showStats
};