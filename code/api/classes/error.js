class MysqlError extends Error {
	constructor(err) {
		super(err);
		Object.assign(this, err);
	}
}

class UnauthorizedError extends Error {
	
}

class InvalidFormatError extends Error {
	constructor(message) {
		super(message);
	}
}

module.exports = {MysqlError, UnauthorizedError, InvalidFormatError};