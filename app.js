// Express
const express = require('express');

// .env
require('dotenv').config();

// Async errors
require('express-async-errors');

// Connect to DB
const connectDB = require('./db/connect');

// App
const app = express();

// Express rate limiter (for heroku...)
app.set('trust proxy', 1);

// Static front-end asset (Jobster project in JohnSmilgaReact) ! NEW !!!
const path = require('path');
app.use(express.static(path.resolve(__dirname, '../../JohnSmilgaReact/Redux/jobster-v2/build')));
// Middlewares
app.use(express.json());
// Security middlewares
const helmet = require('helmet');
app.use(helmet());
const xss = require('xss-clean');
app.use(xss());

// Routes
// Auth
const authRouter = require('./routes/auth');
app.use('/api/v1/auth', authRouter);
// Jobs
const jobsRouter = require('./routes/jobs');
const authenticateUser = require('./middleware/authentication');
app.use('/api/v1/jobs', authenticateUser, jobsRouter);
// Front-end for all other routes !!!! ! NEW !!!
// Serve index.html (in front-end) for all routes
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../../JohnSmilgaReact/Redux/jobster-v2/build', 'index.html'));
});
// 404, if front-end doesn't exist we send the not-found
const notFoundMiddleware = require('./middleware/not-found');
app.use(notFoundMiddleware);
// Custom error
const errorHandlerMiddleware = require('./middleware/error-handler');
app.use(errorHandlerMiddleware);

// Port, because whe run React app on port 3000 ! NEW !!!
const port = process.env.PORT || 5000;

// Start / Listen
const start = async() => {
	try {
		await connectDB(process.env.MONGO_URI);
		app.listen(port, console.log(`Server is listening on port ${ port }...`));
	} catch (error){
		console.log(error);
	}
};
start();