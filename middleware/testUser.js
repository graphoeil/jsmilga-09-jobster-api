// Imports
const { BadRequestError } = require('../errors')

// Test user
const testUser = (req, res, next) => {
	if (req.user.testUser){
		throw new BadRequestError('Test user. Read only !');
	}
	next();
};

// Export
module.exports = testUser;