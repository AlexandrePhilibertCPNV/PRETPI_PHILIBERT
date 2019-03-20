'use strict';

const Router = require('router');

const activityActions = require('../actions/activity.js');

class ActivityController {
	constructor(req, res) {
		let router = new Router();
		
		router.get('/api/activity/:id', (req, res) => {
			let id = req.params.id;
			activityActions.get(id).then((activity) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(activity));
			});
		}).put('/api/activity/:id', (req, res) => {
			let id = req.params.id;
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
				activityActions.update(id, post).then((state) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(state));
				});
			});		
		}).delete('/api/activity/:id', (req, res) => {
			let id = req.params.id;
			activityActions.delete(id).then((state) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(state));
			});
		});
		
		
		router(req, res, () => {
			
		});
	}
}

module.exports = ActivityController;