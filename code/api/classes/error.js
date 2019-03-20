class ApiError extends Error {
	constructor(message) {
		super(message)
	}
}

class MysqlError extends Error {

}

class UnauthorizedError extends Error {

}

class InvalidFormatError extends Error {

}

class MissingFieldError extends Error {

}

module.exports = {MysqlError, UnauthorizedError, InvalidFormatError, MissingFieldError};