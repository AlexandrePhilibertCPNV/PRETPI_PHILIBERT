const Router = require('router');
const uuidv4 = require('uuid/v4');

const activityActions = require('../actions/activity.js');
const ResponseManager = require('../classes/responseManager.js');

class ActivityTypeController {
	constructor(req, res) {

	}
	
	run(req, res) {
		return new Promise((resolve, reject) => {
			let router = new Router();
			let responseManager = new ResponseManager(res);
			
			router.get('/api/activity-type', (req, res) => {
				activityActions.getTypes().then(types => {
					responseManager.setData(types);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});
			
			router.get('/api/activity-type/:activityTypeId', (req, res) => {
				let activityTypeId = req.params.activityTypeId;
				
				activityActions.getTypes(activityTypeId).then(types => {
					responseManager.setData(types);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});
			
			router.post('/api/activity-type', (req, res) => {	
				let body = JSON.parse(req.body);

				activityActions.createType(body).then(id => {
					// return the Id of the created activityType
					responseManager.addData({id});
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager
					};
					reject(reason);
				});
			});
			
			router(req, res, () => {
				
			});
		});
		
	}
}

module.exports = ActivityTypeController;