'use strict';

/**
 *  @file user.js
 *  @brief Controller that handle user actions depending on the endpoint 
 */

const querystring = require('querystring');
const Router = require('router');
const uuidv4 = require('uuid/v4');

const ResponseManager = require('../classes/responseManager.js');
const {MysqlError, InvalidFormatError, UnauthorizedError} = require('../classes/error.js');
const userActions = require('../actions/user.js');
const tokenActions = require('../actions/token.js');
const activityActions = require('../actions/activity.js');
const AuthManager = require('../classes/authManager.js');

class UserController {
	constructor() {
	
		
	}
	
	run(req, res) {
		return new Promise((resolve, reject) => {
			let router = new Router();
			let responseManager = new ResponseManager(res);
		
			router.get('/api/user', (req, res) => {
				userActions.get().then(result => {
					responseManager.setData(result);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});
			
			router.get('/api/user/:id', (req, res) => {
				let id = req.params.id;
				userActions.get(id).then((result) => {
					responseManager.addData(JSON.stringify(result));
					resolve(responseManager);
				}).catch((err) => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});
			
			router.post('/api/user', (req, res) => {
				let body = JSON.parse(req.body);
				
				userActions.create(body).then((userId) => {
					responseManager.addData({userId: userId});
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});
			
			router.post('/api/user/:id/activity', (req, res) => {
				let body = JSON.parse(req.body);
				body.userId = req.params.id;
				
				let token = AuthManager.parseBearer(req.headers['authorization']);
				AuthManager.validateUserSession(token, userId).then(() => {
					activityActions.get({userId: body.userId}).then(activities => {
						if(activities.length >= 10) {
							let reason = {
								err: new UnauthorizedError('Cannot create more than 10 activities, subscribe to create more'),
								responseManager: responseManager
							};
							reject(reason);
						}
						activityActions.create(body).then(activityId => {
							responseManager.addData(activityId);
							responseManager.end();
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
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			
			});
			
			router.put('/api/user/:id', (req, res) => {
				
				let userId = req.params.id;
				let token = AuthManager.parseBearer(req.headers['authorization']);
				AuthManager.validateUserSession(token, userId).then(() => {
					let body = JSON.parse(req.body);
					userActions.update(userId, body).then(() => {
						responseManager.addData({succeded: true});
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
			
			router.get('/api/user/:id/activity', (req, res) => {
				let userId = req.params.id;
				activityActions.get({userId: userId}).then(activities => {
					responseManager.setData(activities);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});

			router(req, res, (err) => {
				if(err) {
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

module.exports = UserController;