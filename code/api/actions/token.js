const crypto = require('crypto');

function _createHeader() {
	return {
		typ: 'JWT',
		alg: 'HS256'
	}
}

function _createPayload(parameters) {
	return {
		userId: parameters.id
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
	/*
	 *	Creates a JWT based on the parameters we give it.
	 *	The JWT '+' sign is replaced with the '-' sign to conform to the RFC 7519 standard
	 *
	 *	@return	the JWT HS256 encoded without '=' as padding in the base64 elements
	*/
	createJWT: function(parameters, payload) {
		let headerObject = _createHeader();
		let header = Buffer.from(JSON.stringify(headerObject)).toString('base64');
		
		//we don't want to query the database if we are just validating the JWT
		if(typeof payload === 'undefined') {
			let payloadObject = _createPayload(parameters);
			payload = Buffer.from(JSON.stringify(payloadObject)).toString('base64');
		}
		
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
	
	validateJWT: function(JWT, parameters) {
		let receivedToken = _splitToken(JWT);
		let receivedSignature = _sign(receivedToken.data);
		let token = this.createJWT(parameters, receivedToken.payload);
		
		if(receivedSignature === token.signature) {
			return true;
		}
		
		return false;
	}
}