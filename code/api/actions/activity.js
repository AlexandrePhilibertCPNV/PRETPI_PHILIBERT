'use strict';

/**
 *  @file activity.js
 *  @brief Handle activity object actions (create, read, update & delete), as well as positions and type
 */

const uuidv4 = require('uuid/v4');
const gpxParse = require('gpx-parse');
const gpsDistance = require('gps-distance');
const validator = require('validator');

const DatabaseManager = require('../classes/databaseManager');
const {MissingFieldError, MysqlError, InvalidFormatError} = require('../classes/error.js');

//Check if all the fields in the object are different than "undefined"
let _checkValuesFilled = function(values) {
	for(let key in values) {
		if(typeof values[key] === 'undefined') {
			throw new MissingFieldError('undefined field: ' + key);
		}
	}
};

// gpsDistance array index
const LATITUDE_GPSDISTANCEINDEX = 0;
const LONGITUDE_GPSDISTANCEINDEX = 1;

/**
 *  @brief Computes the total distance (in kilometers) between points 
 *  
 *  @param waypoints array of GPS positions ex. [[lat: 6.4, lon: 12.5], [...]]
 *  
 *  @return total distance between points in kilometers
 */
function _computeTotalDistance(waypoints) {
	let points = [];
	for(let i = 0; i < waypoints.length; i++) {
		points[i] = [];
		points[i][LATITUDE_GPSDISTANCEINDEX] = waypoints[i].lat;
		points[i][LONGITUDE_GPSDISTANCEINDEX] = waypoints[i].lon;
	}
	return gpsDistance(points);
}

/*
 *	
*/
module.exports = {
	
	create: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(new MysqlError(err.message));
			});
			
			let activityId = uuidv4();
			if(!params.gpx || params.gpx === '') {
				let values = {
					id: activityId,
					start_timestamp: params.start_timestamp,
					end_timestamp: params.end_timestamp,
					total_distance_km: params.total_distance_km,
					total_average_speed: params.total_average_speed,
					fk_user: params.userId,
					fk_activityType: params.activityTypeId
				};
				
				_checkValuesFilled(values);
				
				// Check timestamp format
				if(!validator.isRFC3339(params.start_timestamp)) {
					reject(new InvalidFormatError('start_timestamp format is invalid'));
					return;
				}
				if(!validator.isRFC3339(params.end_timestamp)) {
					reject(new InvalidFormatError('end_timestamp format is invalid'));
					return;
				}
				
				dbManager.query('INSERT INTO tbl_activity SET ?', values, (err, result) => {
					if(err) {
						reject(new MysqlError(err.message));
						return;
					}					
					resolve(activityId);
				});
				return;
			}
			
			this.parseGpx(params.gpx).then((parsedGpx) => {
				
				let waypoints = parsedGpx.tracks[0].segments[0];
				let startTimestamp = new Date(waypoints[0].time);
				let endTimestamp = new Date(waypoints[waypoints.length-1].time);
				
				let values = {
					id: activityId,
					start_timestamp: startTimestamp,
					end_timestamp: endTimestamp,
					fk_user: params.userId,
					fk_activityType: params.activityTypeId,
					gpx: params.gpx
				};
				
				_checkValuesFilled(values);
				
				dbManager.query('INSERT INTO tbl_activity SET ?', values, (err, result) => {
					if(err) {
						reject(new MysqlError(err.message));
						return;
					}
					
					this.addPositions(activityId, waypoints);
					
					// for(let index = 0; index < waypoints.length; index++) {
						// this.addPosition(activityId, waypoints[index]);
					// }
					
					let totalDistanceKm =  _computeTotalDistance(waypoints);
					let startTimeSeconds = startTimestamp.getTime() / 1000;
					let endTimeSeconds = endTimestamp.getTime() / 1000;
					let deltaTimeSeconds = Math.abs(startTimeSeconds - endTimeSeconds);
					let averageSpeed = totalDistanceKm / (deltaTimeSeconds / 1000 / 60 / 60);
					
					let valuesUpdate = {
						total_distance_km: totalDistanceKm,
						total_average_speed: averageSpeed
					};
					
					this.update(activityId, valuesUpdate).catch(err => {
						console.error(err);
					});
					
					resolve(activityId);
				});
			}).catch(err => {
				reject(err);
			});
		});
	},
	
	/**
	 *  @brief Get activity from database
	 *  
	 *  @param params Object containing either userId or activityId attribute
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	get: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				throw err;
			});
			
			//Fields we return to the user
			let selectedFields = [
				'id',
				'gpx',
				'start_timestamp',
				'end_timestamp',
				'total_distance_km',
				'total_average_speed',
				'fk_activityType'
			];
			
			let sql = 'SELECT ?? FROM tbl_activity WHERE ';
			//userId or activityId must be set
			if(!params.userId && !params.activityId) {
				reject(new MissingFieldError('Missing userId or activityId parameter'));
				return;
			}
			if(params.userId) {
				sql += 'fk_user= "' + params.userId + '"';
			}
			if(params.activityId) {
				sql += 'id= "' + params.activityId + '"';
			}
			
			dbManager.query(sql, [selectedFields], (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(err);
					return;
				}
				resolve(result);
			});
		});
	},
	
	/**
	 *  @brief Update activity from database
	 *  
	 *  @param id     id of activity we want to update
	 *  @param params Object containing fields we want to update (ex: {total_distance_km: 12})
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	update: function(id, params) {
		return new Promise((resolve, reject) => {
		
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			let sql = 'UPDATE tbl_activity SET ? WHERE id=?';
			dbManager.query(sql, [params, id], (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(err);
					return;
				}
				resolve("Activity was correctly updated");
			});
		});
	},
	
	/**
	 *  @brief Update activity from database and set removed column to true
	 *  
	 *  @param id activity id
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	delete: function(id) {
		return new Promise((resolve, reject) => {
			this.update(id, {removed: 1}).then(result => {
				resolve("Activity was correctly removed");
			}).catch(err => {
				reject(err);
			});
		});
	},
	
	
	/**
	 *  @brief Create a new activity-type in tbl_ActivityType SQL table
	 *  
	 *  @param params Object containing name and removed attribute
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	createType: function(params) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
				return;
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
	
	/**
	 *  @brief Return one or all activity-type depending on function paramters
	 *  
	 *  @param id optional activity-type id
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	getTypes: function(id) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			let sql = 'SELECT * FROM tbl_activityType';
			if(typeof id !== 'undefined') {
				sql += ' WHERE id="' + id + '"';
			}

			dbManager.query(sql, (err, result) => {
				dbManager.endConnection();
				if(err) {
					throw err;
				}
				resolve(result);
			});
		});
	},
	
	/**
	 *  @brief parse gpx (XML) string
	 *  
	 *  @param gpx string containing GPX 
	 *  
	 *  @return resolve with gpx data in array or reject with error
	 */
	parseGpx: function(gpx) {
		return new Promise((resolve, reject) => {
			gpxParse.parseGpx(gpx, (err, data) => {
				if(err) {
					reject(err);
				}
				resolve(data);
			});
		});
	},
	
	/**
	 *  @brief add positions by bulk insert
	 *  
	 *  @param activityId   id of the activity
	 *  @param gpxWaypoints array containing the gps waypoints (ex: [{lat: 12, lon: 4.45}, {lat: 23, lon: 65}])
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	addPositions: function(activityId, gpxWaypoints) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch(err => {
				reject(err);
			});
			
			let values = [];
			// Create values array
			for(let i = 0; i < gpxWaypoints.length; i++) {
				let waypoint = [
					uuidv4(),
					activityId,
					gpxWaypoints[i].lat,
					gpxWaypoints[i].lon,
					gpxWaypoints[i].time,
					gpxWaypoints[i].elevation
				];
				values[i] = waypoint;
			}
			
			let sql = dbManager.format('INSERT INTO tbl_position (id, fk_activity, latitude, longitude, timestamp, altitude) VALUES ?', [values]);
			dbManager.query(sql, (err, result) => {
				if(err) {
					reject(err)
				}
				resolve(result);
			});
		});
	},
	
	/**
	 *  @brief Insert single position to database
	 *  
	 *  @param activityId  id of the activity
	 *  @param gpxWaypoint single waypoint (ex: {lat: 11.23, lon: 34.756})
	 *  
	 *  @return promise either resolve with SQL query result or reject with error
	 */
	addPosition: function(activityId, gpxWaypoint) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch(err => {
				throw err;
			});
			
			let id = uuidv4();
			
			let values = {
				id: id,
				fk_activity: activityId,
				latitude: gpxWaypoint.lat,
				longitude: gpxWaypoint.lon,
				timestamp: gpxWaypoint.time,
				altitude: gpxWaypoint.elevation
			};
			
			_checkValuesFilled(values);

			dbManager.query('INSERT INTO tbl_position SET ?', values, (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(err);
				}
				resolve(result);
			});
		});
	},
	
	/**
	 *  @brief Select single or multiple position from database
	 *  
	 *  @param activityId id of activity to which the position belongs
	 *  @param positionId optional id of position record
	 *  
	 *  @return Return description
	 */
	getPosition: function(activityId, positionId) {
		return new Promise((resolve, reject) => {
			let dbManager = new DatabaseManager();
			dbManager.createConnection();
			dbManager.connect().catch(err => {
				reject(err);
			});
			
			if(typeof activityId === 'undefined') {
				throw new MissingFieldError('Missing activityId field');
			}
			
			let sql = 'SELECT ?? FROM tbl_position WHERE fk_activity= "' + activityId + '"';
			if(typeof positionId !== 'undefined') {
				sql += 'positionId= "' + positionId + '"';
			}
			
			let selectedFields = [
				'latitude',
				'longitude',
				'timestamp',
				'altitude'
			];
			
			dbManager.query(sql, [selectedFields], (err, result) => {
				dbManager.endConnection();
				if(err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}
}