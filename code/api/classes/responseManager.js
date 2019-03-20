'use strict';

const {MissingFieldError} = require('../classes/error.js');

/*
 *	This class controls the structure of data returned to the user and it's behavior
*/
class ResponseManager {
	/*
	 *	@res	contains the response object from http.createServer()
	*/
	constructor(res) {
		if(typeof res === 'undefined') {
			throw new Error('Missing res parameter');
		}
		this.res = res;
		this.responseBody = {};
		this.responseBody.data = [];
		this.responseBody.error = {};
		
		//default values
		this.res.statusCode = 200;
		this.res.setHeader('Content-Type', 'application/json');
	}
	
	setStatusCode(code) {
		this.res.statusCode = code;
		return this;
	}
	
	setHeader(name, value) {
		this.res.setHeader(name, value);
		return this;
	}
	
	addData(data) {
		this.responseBody.data.push(data);
		return this;
	}
	
	setData(data) {
		if(!Array.isArray(data)) {
			throw new InvalidFormatError('parameter "data" should be an array');
		}
		this.responseBody.data = data;
		return this;
	}
	
	setError(error) {
		this.responseBody.error = error;
		return this;
	}
	
	/*
	 *	@body	the body of the HTTP request returned to the user	
	 *
	*/
	end(body) {
		if(typeof body !== 'undefined') {
			res.end(body);
			return;
		}
		if(this.responseBody.data.length === 0 && Object.entries(this.responseBody.error).length === 0) {
			throw new MissingFieldError('Response body needs data or error attribute');
		}
		let response = JSON.stringify(this.responseBody);
		this.res.end(response);
	}
}

module.exports = ResponseManager;