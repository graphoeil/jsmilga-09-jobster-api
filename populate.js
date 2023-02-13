// .env
require('dotenv').config();

// Mongoose and db connection
const connectDB = require('./db/connect');

// Job model
const Job = require('./models/Job');

// !!! Warning, await Job.deleteMany(); will delete jobs already present in the mongoDB !!!

// Jobs from Mockaroo
// In the data jobs where created with the demo account id ;-)
const fakeData = require('./fake-data.json');

// Auto populate mongoDB with data from products.json
const start = async() => {
	try {
		await connectDB(process.env.MONGO_URI);
		// Remove all products from db
		await Job.deleteMany();
		// Add all products from json
		await Job.create(fakeData);
		// Success confirmation
		console.log('Populate DB successfull !');
		// Exit
		process.exit(0);
	} catch (error){
		console.log(error);
		// Exit with error code
		process.exit(1);
	}
};

// Init => we start this file with node populate.js (not npm start => nodemon)
start();