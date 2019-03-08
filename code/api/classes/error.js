class MysqlError extends Error {
	constructor(err) {
		super(err);
		Object.assign(this, err);
	}
}

class UnauthorizedError extends Error {
	
}

class InvalidFormatError extends Error {
	
}

module.exports = {MysqlError, UnauthorizedError, InvalidFormatError};