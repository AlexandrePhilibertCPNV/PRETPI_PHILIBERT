'use strict';

/**
 *  @file authManager.js
 *  @brief Class that handles user sessions
 */

const DatabaseManager = require('./databaseManager.js');
const {MissingFieldError, MysqlError, InvalidFormatError, UnauthorizedError} = require('./error.js');

var AuthManager = {};

/**
 *  @brief Validate the user session by matching the token with the userId and validating the timestamp
 *  
 *  @param token  session token in string format
 *  @param userId Id of user in string format
 *  
 *  @return promise that resolves if session is valid, rejects if not
 */
AuthManager.validateUserSession = function(token, userId) {
	return new Promise((resolve, reject) => {
		AuthManager.getUserSession(token, userId).then(session => {
			if(AuthManager.isTimestampValid(session.validity_timestamp)) {
				resolve();
				return;
			}
			reject(new UnauthorizedError('Session no longer valid'));
		}).catch(err => {
			reject(err);
			return;
		});
	});
}


/**
 *  @brief Static method that retreives to which user the token belongs
 *  
 *  @param token  session token in string format
 *  @param userId Id of user in string format
 *  
 *  @return promise that resolves if session is found in database, rejects if not
 */
AuthManager.getUserSession = function(token, userId) {
	return new Promise((resolve, reject) => {
		if(typeof token === 'undefined') {
			reject(new MissingFieldError('Missing token field'));
			return;
		}
		
		let dbManager = new DatabaseManager();
		dbManager.createConnection();
		dbManager.connect().catch((err) => {
			reject(err);
		});
		
		dbManager.query('SELECT * FROM tbl_session WHERE value=? AND fk_user=?', [token, userId], (err, result) => {
			if(err) {
				reject(MysqlError(err.message));
				return;
			}
			if(typeof result[0] === 'undefined' || !result[0].fk_user) {
				reject(new Error('Authentification Error'));
				return;
			}
			
			resolve(result[0]);
		});
	});	
}

/**
 *  @brief Check if the timestamp is still valid
 *  
 *  @param validity timestamp in string format (ex: 2018-12-29T11:55:38.000Z)
 *  
 *  @return true if valid, false if not
 */
AuthManager.isTimestampValid = function(validity) {
	if(typeof validity === 'undefined') {
		throw new MissingFieldError('Missing validity attribute');
	}
	
	let tokenValidity = new Date(validity).getTime();
	let now = new Date().getTime();
	
	if(tokenValidity < now) {
		return false;
	}
	return true;
}
	
/**
 *  @brief parse of the bearer token
 *  
 *  @param bearer token we want to parse
 *  
 *  @return only the token part without 'Bearer ' in front
 */
AuthManager.parseBearer = function(bearer) {
	if(typeof bearer === 'undefined') {
		throw new MissingFieldError('Missing bearer parameter');
	}
	let token;
	try {
		token = bearer.split('Bearer ').pop();
	} catch(err) {
		throw new InvalidFormatError('Bearer token format invalid');
	}
	return token;
}

module.exports = AuthManager;