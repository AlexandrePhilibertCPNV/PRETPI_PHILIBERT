'use strict';

const crypto = require('crypto');

class Util {
	
}

/*
 *	Static method to generate a string of a given size
 *
 *	return	the generated string
*/
Util.getRandomString = function(size) {
	return crypto.randomBytes(Math.ceil(size/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,size);
}

module.exports = Util;