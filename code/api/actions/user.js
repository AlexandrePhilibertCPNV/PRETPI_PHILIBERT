const uuidv4 = require('uuid/v4');
const validator = require('validator');

const DatabaseManager = require('../db/databaseManager.js');
const {MysqlError, InvalidFormatError} = require('../classes/error.js');
const dbConfig = require('../config/dbConfig.js');

let FIELD_ALLOWED_MODIFICATION = [
	'firstname',
	'lastname',
	'password',
	'phonenumber'
];

module.exports = {
	
	/*
	 *	@params		contains the user informations
	 *	@callback	returns the user id when the user was inserted in db
	*/
	create: function(params, callback) {
		
		let dbManager = new DatabaseManager();	
		
		let connection = dbManager.createConnection({
			host: 'localhost',
			user: dbConfig.user,
			password: dbConfig.password,
			port: 3306,
			insecureAuth: true,
			database: 'runscape'
		});
		
		connection.connect((err) => {
			if(err) {
				throw new MysqlError(err);
			}
		});
		
		if(!validator.isEmail(params.email)) {
			callback(new InvalidFormatError('Email format invalid'));
		}
		
		if(params.password.length < 8) {
			callback(new InvalidFormatError('Password too short'));
		}
		
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
				callback(new InvalidFormatError('Missing value in request body'));
			}
		}
		
		connection.query("INSERT INTO tbl_user SET ?", values, (err, result) => {
			if(err) {
				callback(new MysqlError(err))
				return;
			}
			callback(err, id);
		});
	},
	
	update: function(id, params) {
		
		let dbManager = new DatabaseManager();
		
		let connection = dbManager.createConnection({
			host: 'localhost',
			user: dbConfig.user,
			password: dbConfig.password,
			port: 3306,
			insecureAuth: true,
			database: 'runscape'
		});
		
		connection.connect((err) => {
			if(err) {
				throw new MysqlError(err);
			}
		});
		
		let values = params;
		for(let key in params) {
			//if the field isn't allowed modification
			if(!FIELD_ALLOWED_MODIFICATION.includes(key)) {
				delete values[key];
			}
		}
		
		connection.query("UPDATE tbl_user SET ? WHERE id=?",[values, id], (err, result) => {
			if(err) {
				throw new MysqlError(err);
			}
			console.log("working");
		});
	}
}