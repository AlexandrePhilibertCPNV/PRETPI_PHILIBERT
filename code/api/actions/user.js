'use strict';

/**
 *  @file user.js
 *  @brief handle the user actions (create, get, update...)
 */

const uuidv4 = require('uuid/v4');
const validator = require('validator');
const crypto = require('crypto');

const Util = require('../classes/util.js');
const DatabaseManager = require('../classes/databaseManager.js');
const {MysqlError, InvalidFormatError, MissingFieldError} = require('../classes/error.js');
const dbConfig = require('../config/dbConfig.js');

const FIELD_ALLOWED_MODIFICATION = [
	'firstname',
	'lastname',
	'password',
	'phonenumber'
];

module.exports = {
	
	/**
	 *  @brief insert a user in the database
	 *  
	 *  @param params contains the user informations (email, password, firstname, etc..)
	 *  
	 *  @return returns the user id when the user was inserted in db
	 */
	create: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();	
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			let id = uuidv4();
			
			let values = {
				'id': id,
				'firstname': params.firstname,
				'lastname': params.lastname,
				'password': params.password,
				'email': params.email,
				'phonenumber': params.phonenumber
			};		
			
			for(let value in values) {
				if(typeof values[value] === 'undefined') {
					throw new InvalidFormatError('Missing value in request body');
				}
			}
						
			values.password_salt = Util.getRandomString(16);
			let hmac = crypto.createHmac('sha256', values.password_salt); /** Hashing algorithm sha256 */
			hmac.update(params.password);
			values.password = hmac.digest('hex');
				
			
			if(!validator.isEmail(values.email)) {
				throw new InvalidFormatError('Email format invalid');
			}
			
			if(values.password.length < 8) {
				throw new InvalidFormatError('Password too short');
			}
			
			dbManager.query("INSERT INTO tbl_user SET ?", values, (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(new MysqlError(err.message));
					return;
				}
				resolve(id);
			});
		});
	},
	
	/**
	 *  @brief get a single user or multiple user
	 *  
	 *  @param id (optional)	id of the user we want to select
	 *  
	 *  @return promise which contain the SQL query result
	 */
	get: function(id) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();	
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			let sql = "SELECT * FROM tbl_user";
			if(typeof id !== 'undefined') {
				sql += " WHERE id='" + id + "'";
			}
			dbManager.query(sql, (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(new Error('Could not find user'));
				}
				resolve(result);
			});
		});
	},
	
	/**
	 *  @brief Update allowed fields present in tbl_user
	 *  
	 *  @param id     UUID of the user we want to update
	 *  @param params contains the fields and value that should be changed
	 *  
	 *  @return promise that resolves if success, fails otherwise
	 */
	update: function(id, params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			let values = params;
			for(let key in params) {
				//if the field isn't allowed modification
				if(!FIELD_ALLOWED_MODIFICATION.includes(key)) {
					delete values[key];
				}
			}
			
			//reject if no values are present
			if(!Array.isArray(values) || values.length === 0) {
				reject(new MissingFieldError('No fields where given or fields are not allowed modification'));
				return;
			}
			
			//if password param is set, create new salt and hash
			if(values.password) {
				values.password_salt = Util.getRandomString(16);
				let hmac = crypto.createHmac('sha256', values.password_salt); /** Hashing algorithm sha256 */
				hmac.update(params.password);
				values.password = hmac.digest('hex');
			}
			
			dbManager.query("UPDATE tbl_user SET ? WHERE id=?",[values, id], (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(err);
				}
				resolve();
			});
		});
	},
	
	login: function(email, password) {
		return new Promise((resolve, reject) => {
			if(typeof email === 'undefined' || typeof password === 'undefined') {
				reject(new MissingFieldError('Missing email or password'))
			} 
			
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			dbManager.query('SELECT password_salt FROM tbl_user WHERE email=?', [email], (err, result) => {
				if(err) {
					reject(new MysqlError(err.message));
					return;
				}
				if(typeof result === 'undefined' || typeof result[0] === 'undefined') {
					reject(new Error('Login failed'));
					return;
				}
				let hmac = crypto.createHmac('sha256', result[0].password_salt); /** Hashing algorithm sha256 */
				hmac.update(password);
				let receivedHashedPassword = hmac.digest('hex');
				
				
				let sql = 'SELECT id, password FROM tbl_user WHERE email=?';
				dbManager.query(sql, [email, password], (err, result) => {
					dbManager.endConnection();
					if(err) {
						reject(new MysqlError(err.message));
						return;
					}
					if(result.length === 0) {
						reject(new Error('Login failed'));
						return;
					}
					if(receivedHashedPassword === result[0].password) {
						resolve(result[0]);
						return;
					}
					reject(new Error('Login failed'));
				});
			});			
		});
	}
}