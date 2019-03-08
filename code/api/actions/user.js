const uuidv4 = require('uuid/v4');
const validator = require('validator');

const DatabaseManager = require('../db/databaseManager.js');
const {MysqlError} = require('../classes/error.js');
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
			throw new Error('Email format invalid');
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
				throw new Error('Missing value');
			}
		}
		
		connection.query("INSERT INTO tabl_user SET ?", values, (err, result) => {
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
		
		var query = 'UPDATE tbl_user SET ';
		for(let key in params) {
			//if the field isn't allowed modification
			if(!FIELD_ALLOWED_MODIFICATION.includes(key)) {
				continue;
			}
			query += key + "=";
			if(typeof params[key] === 'number' || typeof params[key] === 'boolean') {
				query += params[key] + ",";
			} else if(typeof params[key] === 'string') {
				query += "'" + params[key] + "',";
			} else {
				throw new Error('unsupported parameter type for: ' + key);
			}
		}
		//remove the last ","
		query = query.substr(0, query.length-1);
		query += " WHERE id='" + id + "'";

		connection.query(query, (err, result) => {
			if(err) {
				throw err;
			}
			return result;
		});
	}
}