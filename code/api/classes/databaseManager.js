const mysql = require('mysql');

const {MysqlError} = require('../classes/error.js');
const dbConfig = require('../config/dbConfig.js');

class DatabaseManager {
	
	constructor() {
		this.connection;
	}
	
	format(query, parameters) {
		return mysql.format(query, parameters)
	}
	
	createPool(database) {
		return mysql.createPool(database);
	}

	connect() {
		return new Promise((resolve, reject) => {
			if(typeof this.connection === 'undefined') {
				throw new MysqlError('connection undefined');
			}
			this.connection.connect((err) => {
				if(err) {
					throw new MysqlError('Could not connect to database');
				}
				resolve();
			})
		});
	}
	
	query(query, values, callback) {
		if(typeof this.connection === 'undefined') {
			throw new MysqlError('connection undefined');
		}
		this.connection.query(query, values, callback);
	}
	
	endConnection() {
		if(typeof this.connection === 'undefined') {
			throw new MysqlError('connection undefined');
		}
		this.connection.end();
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
			this.connection = mysql.createConnection(params);
			return;
		}
		this.connection = mysql.createConnection({
			host: 'localhost',
			user: dbConfig.user,
			password: dbConfig.password,
			port: 3306,
			insecureAuth: true,
			database: 'runscape'
		});
	}
}

module.exports = DatabaseManager;