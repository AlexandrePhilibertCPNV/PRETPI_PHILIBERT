const uuidv4 = require('uuid/v4');

const DatabaseManager = require('../classes/databaseManager');
const {MissingFieldError} = require('../classes/error.js');

//Check if all the fields in the object are different than "undefined"
_checkValuesFilled = function(values) {
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
	
	create: function(params, callback) {
		
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		let activityId = uuidv4();
		let values = {
			id: activityId,
			fk_user: params.userId,
			fk_activity: params.activityTypeId,
			gpx: params.gpx
		};
		
		_checkValuesFilled(values);
		
		connection.query('INSERT INTO tbl_activity SET ?', values, (err, result) => {
			if(err) {
				throw err;
			}
			callback(activityId);
		});
	},
	
	get: function(id, callback) {
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		let fieldReturned = [
			'id',
			'gpx'
		];
		
		let whereClause = {
			id: id
		};
		
		connection.query('SELECT ?? FROM tbl_activity WHERE ?', [fieldReturned, whereClause], (err, result) => {
			callback(result);
		});
	},
	
	update: function(id, params, callback) {
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		let values = params;
		for(let key in params) {
			//if the field isn't allowed modification
			if(!FIELD_ALLOWED_MODIFICATION.includes(key)) {
				delete values[key];
			}
		}
		
		let query = dbManager.format('UPDATE tbl_activity SET ? WHERE id=?', [values, id]);
		
		connection.query('UPDATE tbl_activity SET ? WHERE id=?', [values, id], (err, result) => {
			if(err) {
				throw err;
			}
			callback("Activity was correctly updated");
		});
	},
	
	delete: function(id, callback) {
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		let values = {
			removed: 1
		};
		
		connection.query('UPDATE tbl_activity SET ? WHERE id=?', [values, id], (err, result) => {
			if(err) {
				throw err;
			}
			callback('Activity was correctly removed');
		});
	},
	
	createType: function(params) {
		
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		let activityTypeId = uuidv4();
		let values = {
			id: activityTypeId,
			name: params.name,
			removed: params.removed
		};
		
		_checkValuesFilled(values);
		
		let query = dbManager.format('INSERT INTO tbl_activityType SET ?', values);
		
		connection.query(query, (err, result) => {
			if(err) {
				throw err;
			}
			console.log(result);
		});
		
		return activityTypeId;
	},
	
	getTypes: function(callback) {
	
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});

		connection.query("SELECT * FROM tbl_activityType", (err, result) => {
			if(err) {
				throw err;
			}
			callback(result);
		});

	}
}