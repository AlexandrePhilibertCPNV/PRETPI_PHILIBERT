'use strict';

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
	
	/*
	 *	@params		contains the user informations (email, password, firstname, etc..)
	 *	@callback	returns the user id when the user was inserted in db
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
	
	
	/*
	 *	@id	(optional)	id of the user we want to select
	 *
	 *	@return			promise which contain the SQL query result
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
	
	/*
	 *	@id		UUID of the user we want to update
	 *	@params	contains the fields and value that should be changed
	 *
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
				throw new MissingFieldError('Missing email or password');
			} 
			
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
				return;
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