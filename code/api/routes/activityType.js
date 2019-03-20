const Router = require('router');
const uuidv4 = require('uuid/v4');

const activityActions = require('../actions/activity.js');

class ActivityTypeController {
	constructor(req, res) {
		let router = new Router();
		
		router.get('/api/activityType', (req, res) => {
			activityActions.getTypes().then((types) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(types));
			});
		});
		
		router.post('/api/activityType', (req, res) => {	
			let body = '';
			req.on('data', (data) => {
				body += data.toString();
				
				//~ 2Mb 
				if (body.length > 2e6) {
					req.connection.destroy();
				}
			});
			
			req.on('end', () => {
				let post = JSON.parse(body);
				activityActions.createType(post).then((id) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(id));
				});
			});
		});
		
		router(req, res, () => {
			
		});
	}
}

module.exports = ActivityTypeController;