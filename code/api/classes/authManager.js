'use strict';

const DatabaseManager = require('./databaseManager.js');
const {MissingFieldError, MysqlError, InvalidFormatError} = require('./error.js');

var AuthManager = {};

AuthManager.validateUserSession = function(token, userId) {
	return new Promise((resolve, reject) => {
		AuthManager.getUserSession(token, userId).then(session => {
			if(AuthManager.checkSessionValidity(session.validity_timestamp)) {
				resolve();
				return;
			}
			reject();
		}).catch(err => {
			reject(err);
			return;
		});
	});
}

/*
 *	Static method that retreives to which user the token belongs
*/
AuthManager.getUserSession = function(token, userId) {
	return new Promise((resolve, reject) => {
		if(typeof token === 'undefined') {
			throw new MissingFieldError('Missing token field');
		}
		
		let dbManager = new DatabaseManager();
		dbManager.createConnection();
		dbManager.connect().catch((err) => {
			throw err;
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

AuthManager.checkSessionValidity = function(validity) {
	if(typeof validity === 'undefined') {
		throw new MissingFieldError('Missing session validity attribute');
	}
	
	let tokenValidity = new Date(validity).getTime();
	let now = new Date().getTime();
	
	if(tokenValidity < now) {
		return false;
	}
	return true;
}


	/*
	 *	@bearer	token we want to parse
	 *
	 *	@return	only the token part without 'Bearer ' in front
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