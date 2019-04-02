class ApiError extends Error {
	constructor(message) {
		super(message)
	}
}

class MysqlError extends ApiError {

}

class UnauthorizedError extends ApiError {

}

class InvalidFormatError extends ApiError {

}

class MissingFieldError extends ApiError {

}

module.exports = {MysqlError, UnauthorizedError, InvalidFormatError, MissingFieldError};