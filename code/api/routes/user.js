const querystring = require('querystring');
const Router = require('router');
const uuidv4 = require('uuid/v4');

const DatabaseManager = require('../classes/databaseManager.js');
const ResponseManager = require('../classes/responseManager.js');
const {MysqlError, InvalidFormatError, UnauthorizedError} = require('../classes/error.js');
const userActions = require('../actions/user.js');
const tokenActions = require('../actions/token.js');
const dbConfig = require('../config/dbConfig.js');
const activityActions = require('../actions/activity.js');

class UserController {
	constructor() {
		// this.router = new Router();
		
	}
	
	run(req, res) {
		return new Promise((resolve, reject) => {
			let router = new Router();
			
			let dbManager = new DatabaseManager();	
			dbManager.createConnection();
			dbManager.connect().catch((err) => {
				reject(err);
			});
			
			let responseManager = new ResponseManager(res);
		
			router.get('/api/user', (req, res) => {
				userActions.get().then(result => {
					responseManager.setData(JSON.stringify(result));
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			}).get('/api/user/:id', (req, res) => {
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
			}).post('/api/user', (req, res) => {
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
			}).post('/api/user/:id/activity', (req, res) => {
				let params = {
					userId: req.params.id
				};
				let body = JSON.parse(req.body);
				Object.assign(params, body);
			
				activityActions.create(params).then((activityId) => {
					let responseManager = new ResponseManager(res);
					responseManager.setData({activityId: activityId});
					responseManager.end();
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			}).put('/api/user/:id', (req, res) => {
				let authorization = req.headers['authorization'];
				if(typeof authorization === 'undefined') {
					let reason = {
						err: new UnauthorizedError('Access denied, token needed'),
						responseManager: responseManager
					};
					reject(reason);
				}	
				let token = authorization.split('Bearer ').pop();
				if(typeof token === 'undefined') {
					let reason = {
						err: new InvalidFormatError('Token format invalid'),
						responseManager: responseManager
					};
				}
				
				connection.query("select * from tbl_user where id ='" + req.params.id + "' LIMIT 1", (err, result) => {
					if(err) {
						throw new MysqlError(err);
					}
					
					if(!tokenActions.validateJWT(token, result[0])) {
						res.statusCode = 401;
						res.end("Unauthorized");
					}

					let body = JSON.parse(req.body);
					userActions.update(req.params.id, body).then((succeded) => {
						if(succeded) {
							res.statusCode = 200;
							res.end("user updated");
							return;
						}
						res.statusCode = 500;
						res.end("user not updated");
					}).catch((err) => {
						if(err instanceof MysqlError) {
							res.statusCode= 500;
							res.end("Server could not create new user");
						} else {
							res.statusCode = 500;
							res.end("Server error");
						}
					});
				});
			});

			router(req, res, (err) => {
				if(err) {
					reject(err);
				}
			});			
		});
	}
	
	
}

module.exports = UserController;