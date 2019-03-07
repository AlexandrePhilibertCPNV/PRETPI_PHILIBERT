const DatabaseManager = require('../db/databaseManager.js');
const uuidv4 = require('uuid/v4');

const dbConfig = require('../config/dbConfig.js');

let FIELD_ALLOWED_MODIFICATION = [
	'firstname',
	'lastname',
	'password',
	'phonenumber'
];

module.exports = {
	
	create: function(params) {
		
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
				throw err;
			}
		});
		
		connection.query("INSERT INTO tbl_user (id, firstname, lastname, password, email, phonenumber) VALUES ('" + 
			uuidv4() + "','" +
			params.firstname + "','" + 
			params.lastname + "','" + 
			params.password + "','" + 
			params.email + "','" + 
			params.phonenumber + "');", (err, result) => {
				if(err) {
					throw err;
				}
				return result;
			}
		);
	},
	
	update: function(id, params) {
		
		let dbManager = new DatabaseManager();
		
		let connection = dbManager.createConnection({
			host: 'localhost',
			user: 'alexandre',
			password: 'X6dwLaoRY?',
			port: 3306,
			insecureAuth: true,
			database: 'runscape'
		});
		
		connection.connect((err) => {
			if(err) {
				throw err;
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