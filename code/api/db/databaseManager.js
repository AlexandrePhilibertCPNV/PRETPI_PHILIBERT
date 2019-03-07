const mysql = require('mysql');

class DatabaseManager {
	
	constructor() {
		
	}
	
	createConnection(database) {
		return mysql.createConnection(database);
	}
	
	createPool(database) {
		return mysql.createPool(database);
	}
}

module.exports = DatabaseManager;