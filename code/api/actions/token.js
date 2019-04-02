const crypto = require('crypto');

const Util = require('../classes/util.js');
const DatabaseManager = require('../classes/databaseManager.js');
const {MysqlError, InvalidFormatError, MissingFieldError} = require('../classes/error.js');

function _createHeader() {
	return {
		typ: 'JWT',
		alg: 'HS256'
	}
}

function _createPayload(parameters) {
	if(typeof parameters.userId === 'undefined') {
		throw new Error('Missing id parameter');
	}
	return {
		userId: parameters.userId
	}
}

function _splitToken(token) {
	let elem = token.split('.');
	if(elem.length < 3) {
		throw new Error('Token format is invalid');
	}
	return {
		header: elem[0],
		payload: elem[1],
		data: elem[0] + '.' + elem[1],
		signature: elem[2]
	}
}

function _clearBase64(string) {
	string = string.replace(/=/g, '');
	string = string.replace(/\+/g, '-');
	return string;
}

function _sign(data) {
	if(data.includes('=') || data.includes('+')) {
		data = _clearBase64(data);
	}

	let signature = crypto.createHmac('sha256', 'secret')
		.update(data)
		.digest('base64');
		
	if(signature.includes('=') || signature.includes('+')) {
		signature = _clearBase64(signature);
	}
	
	return signature;
}

module.exports = {
	
	
	
	create: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(new MysqlError(err.message));
			});
			
			//Create the timestamp until which the timestamp is valid
			let date = new Date();
			date.setDate(new Date().getDate() + 5);
			
			let token = Util.getRandomString(32);
			let values = {
				value: token,
				validity_timestamp: date.toISOString(),
				fk_user: params.userId
			};
			
			dbManager.query('INSERT INTO tbl_session SET id=UUID(), ?', [values], (err, result) => {
				if(err) {
					reject(new MysqlError(err.message));
					return;
				}
				resolve(token);
			});
		});
	},
	
	
	/*
	 *	Creates a JWT based on the parameters we give it.
	 *	The JWT '+' sign is replaced with the '-' sign to conform to the RFC 7519 standard
	 *
	 *	@return	the JWT HS256 encoded without '=' as padding in the base64 elements
	*/
	createJWT: function(parameters) {
		let headerObject = _createHeader();
		let header = Buffer.from(JSON.stringify(headerObject)).toString('base64');
		
		//we don't want to query the database if we are just validating the JWT
		let payloadObject = _createPayload(parameters);
		payload = Buffer.from(JSON.stringify(payloadObject)).toString('base64');
		
		header = _clearBase64(header);
		payload = _clearBase64(payload);
		
		let data = header + "." + payload;
			
		return {
			header: header,
			payload: payload,
			signature: _sign(data)
		}
	},
	
	toString: function(JWT) {
		return JWT.header + "." + JWT.payload + "." + JWT.signature;
	},
	
	validateJWT: function(JWT) {
		try {
			let receivedToken = _splitToken(JWT);;
			let payload = Buffer.from(receivedToken.payload, 'base64').toString('ascii');
			let token = this.createJWT(JSON.parse(payload));

			if(receivedToken.signature === token.signature) {
				return true;
			}
			return false;
		} catch(err) {
			console.error(err);
		}
		
	}
}