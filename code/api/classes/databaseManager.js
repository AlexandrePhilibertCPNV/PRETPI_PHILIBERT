const mysql = require('mysql');

const dbConfig = require('../config/dbConfig.js');

class DatabaseManager {
	
	constructor() {
		
	}
	
	format(query, parameters) {
		return mysql.format(query, parameters)
	}
	
	createConnection(database) {
		return mysql.createConnection(database);
	}
	
	createPool(database) {
		return mysql.createPool(database);
	}
	
	
	/*
	 *	Creates a database connection with the parameters given to the function
	 *	Otherwise creates a connection to the default database
	 *
	 *	@params	contains the database login parameters
	 *	@return	the created connection
	 *
	*/
	createConnection(params) {
		if(typeof params !== 'undefined') {
			return mysql.createConnection(params);
		}
		let connection = mysql.createConnection({
			host: 'localhost',
			user: dbConfig.user,
			password: dbConfig.password,
			port: 3306,
			insecureAuth: true,
			database: 'runscape'
		});
		return connection;
	}
}

module.exports = DatabaseManager;