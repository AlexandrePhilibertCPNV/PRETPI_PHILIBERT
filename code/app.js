'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const Router = require('router');
const querystring = require('querystring');
const mysql = require('mysql');

const dbConfig = require('./api/config/dbConfig.js');
const RequestBodyManager = require('./api/classes/requestBodyManager.js');
const {MysqlError, InvalidFormatError} = require('./api/classes/error.js');

var router = new Router();

const TokenController = require('./api/routes/token.js');
let tokenController = new TokenController();
const UserController = require('./api/routes/user.js');
let userController = new UserController();

let bodyManager = new RequestBodyManager();

router.all('/api/token*', (req, res) => {
	tokenController.run(req, res).then(responseManager => {
		responseManager.end();
	}).catch((reason) => {
		console.error(reason.err);
		if(reason.err instanceof InvalidFormatError) {
			reason.responseManager.setStatusCode(400)
				.setError({code: 'FORMAT_ERR', message: reason.err.message});
		} else {
			reason.responseManager.setStatusCode(500)
				.setError({code: 'SERVER_ERR', message: reason.err.message});
		}
		reason.responseManager.end();
	});
});

router.all('/api/user*', (req, res) => {

	userController.run(req, res).then(responseManager => {
		responseManager.end();
	}).catch((reason) => {
		console.error(reason.err);
		if(reason.err instanceof InvalidFormatError) {
			reason.responseManager.setStatusCode(400)
				.setError({code: 'FORMAT_ERR', message: reason.err.message});
		} else {
			reason.responseManager.setStatusCode(500)
				.setError({code: 'SERVER_ERR', message: reason.err.message});
		}
		reason.responseManager.end();
	});

});

router.all('/api/activityType*', (req, res) => {
	const ActivityTypeController = require('./api/routes/activityType.js');
	let activityTypeController = new ActivityTypeController(req, res);
});

router.all('/api/activity/*', (req, res) => {
	const ActivityController = require('./api/routes/activity.js');
	let activityController = new ActivityController(req, res);
});

router.get('/*', (req, res) => {
	if(req.url === '/login') {
		req.url = '/index.html';
	}
	
	fs.readFile('./website' + req.url, (err, data) => {
		if(err) {
			res.statusCode = 404;
			res.end();
			return;
		}
		res.statusCode = 200;
		res.end(data);
	});
});

let onServerRequest = (req, res) => {
	bodyManager.parse(req).then((body) => {
		req.body = body;
		router(req, res, (err) => {
			if(err) {
				console.error(err);
			}
		});
	}).catch(err => {
		console.error(err);
	});
};

http.createServer(onServerRequest).listen(80);

let options = {};
try {
	options.key = fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/privkey.pem');
	options.cert = fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/cert.pem');
} catch(err) {
	console.error(err)
	console.log("Could not find SSL certificate files, server running under HTTP only");
}

https.createServer(options, onServerRequest).listen(443);