'use strict';

/**
 *  @file util.js
 *  @brief Utility class
 */

const crypto = require('crypto');

var Util = {};

/**
 *  @brief Static method to generate a string of a given size
 *  
 *  @param size size of string
 *  
 *  @return the generated string in hexadecimal format
 */
Util.getRandomString = function(size) {
	return crypto.randomBytes(Math.ceil(size/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,size);
}

module.exports = Util;