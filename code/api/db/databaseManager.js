const mysql = require('mysql');

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
}

module.exports = DatabaseManager;