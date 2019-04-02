'use strict';

const Router = require('router');

const ResponseManager = require('../classes/responseManager.js');
const AuthManager = require('../classes/authManager.js');
const activityActions = require('../actions/activity.js');
const {MissingFieldError, MysqlError, InvalidFormatError, UnauthorizedError} = require('../classes/error.js');

/*
 *	Controller that handle activity actions depending on the endpoint 
*/
class ActivityController {
	constructor() {
		
	}
	
	run(req, res) {
		return new Promise((resolve, reject) => {
			let router = new Router();
			let responseManager = new ResponseManager(res);
			
			router.get('/api/activity/:id', (req, res) => {
				let id = req.params.id;
				
				activityActions.get({activityId: id}).then(activity => {
					responseManager.setData(activity);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			}).get('/api/activity/:activityId/position', (req, res) => {
				let activityId = req.params.activityId;
				
				activityActions.getPosition(activityId).then(positions => {
					responseManager.setData(positions);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			}).get('/api/activity/:activityId/position/:positionId', (req, res) => {
				let activityId = req.params.activityId;
				let positionId = req.params.positionId;
				
				activityActions.getPosition(activityId, positionId).then(positions => {
					responseManager.setData(positions);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			}).put('/api/activity/:id', (req, res) => {
				let id = req.params.id;
				let body = JSON.parse(req.body);
				
				// Validate the user authorization before updating the activity
				let token = AuthManager.parseBearer(req.headers['authorization']);
				AuthManager.validateUserSession(token).then(() => {
					activityActions.update(id, body).then(state => {
						responseManager.addData(state);
						resolve(responseManager);
					}).catch(err => {
						let reason = {
							err: err,
							responseManager: responseManager
						};
						reject(reason);
					});
				}).catch(err => {
					let reason = {
						err: new UnauthorizedError('Invalid token'),
						responseManager: responseManager
					};
					reject(reason);
				});
				
				
			}).delete('/api/activity/:id', (req, res) => {
				let id = req.params.id;
				let body = JSON.parse(req.body);
				
				let token = AuthManager.parseBearer(req.headers['authorization']);
				AuthManager.validateUserSession(token, body.userId).then(() => {
					activityActions.delete(id).then(state => {
						responseManager.addData(state);
						resolve(responseManager);
					}).catch(err => {
						let reason = {
							err: err,
							responseManager: responseManager
						};
						reject(reason);
					});
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});

			router(req, res, err => {
				if(err) {
					console.error(err);
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				}
			});
		});
	}
}

module.exports = ActivityController;