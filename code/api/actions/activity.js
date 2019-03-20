'use strict';

const uuidv4 = require('uuid/v4');

const DatabaseManager = require('../classes/databaseManager');
const {MissingFieldError} = require('../classes/error.js');

//Check if all the fields in the object are different than "undefined"
let _checkValuesFilled = function(values) {
	for(let key in values) {
		if(typeof values[key] === 'undefined') {
			throw new MissingFieldError('undefined filed: ' + key);
		}
	}
};

const FIELD_ALLOWED_MODIFICATION = [
	'start_timestamp',
	'end_timestamp',
	'gpx'
];

module.exports = {
	
	create: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});
			
			let activityId = uuidv4();
			let values = {
				id: activityId,
				fk_user: params.userId,
				fk_activity: params.activityTypeId,
				gpx: params.gpx
			};
			
			_checkValuesFilled(values);
			
			dbManager.query('INSERT INTO tbl_activity SET ?', values, (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve(activityId);
			});
		});
	},
	
	get: function(id) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});
			
			let fieldReturned = [
				'id',
				'gpx'
			];
			
			let whereClause = {
				id: id
			};
			
			let sql = 'SELECT ?? FROM tbl_activity WHERE ?';
			dbManager.query(sql, [fieldReturned, whereClause], (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve(result);
			});
		});
	},
	
	update: function(id, params) {
		return new Promise((resolve, reject) => {
		
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});
			
			let values = params;
			for(let key in params) {
				//if the field isn't allowed modification
				if(!FIELD_ALLOWED_MODIFICATION.includes(key)) {
					delete values[key];
				}
			}
			
			let sql = 'UPDATE tbl_activity SET ? WHERE id=?';
			dbManager.query(sql, [values, id], (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve("Activity was correctly updated");
			});
		});
	},
	
	delete: function(id) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});
			
			let values = {
				removed: 1
			};
			
			let sql = 'UPDATE tbl_activity SET ? WHERE id=?';
			dbManager.query(sql, [values, id], (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve('Activity was correctly removed');
			});
		});
	},
	
	createType: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});
			
			let activityTypeId = uuidv4();
			let values = {
				id: activityTypeId,
				name: params.name,
				removed: params.removed
			};
			
			_checkValuesFilled(values);
			
			let sql = 'INSERT INTO tbl_activityType SET ?';
			dbManager.query(sql, values, (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve(activityTypeId);
			});
		});
	},
	
	getTypes: function() {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});

			dbManager.query("SELECT * FROM tbl_activityType", (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve(result);
			});
		});
	}
}