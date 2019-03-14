const Router = require('router');
const uuidv4 = require('uuid/v4');

const DatabaseManager = require('../classes/databaseManager.js');
const activityActions = require('../actions/activity.js');

class ActivityTypeController {
	constructor(req, res) {
		let router = new Router();
		
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection();
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		router.get('/api/activityType', (req, res) => {
			activityActions.getTypes((types) => {
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
				activityActions.createType(post, (id) => {
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