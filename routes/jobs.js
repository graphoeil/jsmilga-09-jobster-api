// Imports
const express = require('express');
const { getAllJobs, getJob, createJob, updateJob, deleteJob, showStats } = require('../controllers/jobs');
const testUser = require('../middleware/testUser');

// Router
const jobsRouter = express.Router();

// Routes
jobsRouter.route('/').post(testUser, createJob).get(getAllJobs);
jobsRouter.route('/stats').get(showStats);
jobsRouter.route('/:id').get(getJob).patch(testUser, updateJob).delete(testUser, deleteJob);

// Export
module.exports = jobsRouter;