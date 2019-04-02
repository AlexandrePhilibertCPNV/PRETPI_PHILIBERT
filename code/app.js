'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const Router = require('router');
const cookie = require('cookie');

const RequestBodyManager = require('./api/classes/requestBodyManager.js');
const {MysqlError, InvalidFormatError, UnauthorizedError} = require('./api/classes/error.js');

var router = new Router();

const TokenController = require('./api/routes/token.js');
const UserController = require('./api/routes/user.js');
const ActivityController = require('./api/routes/activity.js');
const ActivityTypeController = require('./api/routes/activityType.js');

let tokenController = new TokenController();
let userController = new UserController();
let activityController = new ActivityController();
let activityTypeController = new ActivityTypeController();
let bodyManager = new RequestBodyManager();

/*
 *	Handle all the token route requests
*/
router.all('/api/token*', (req, res) => {
	tokenController.run(req, res).then(responseManager => {
		responseManager.end();
	}).catch(reason => {
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

/*
 *	Handle all the user route requests
*/
router.all('/api/user*', (req, res) => {
	userController.run(req, res).then(responseManager => {
		responseManager.end();
	}).catch(reason => {
		console.error(reason.err);
		if(reason.err instanceof InvalidFormatError) {
			reason.responseManager.setStatusCode(400)
				.setError({code: 'FORMAT_ERR', message: reason.err.message});
		} else if (reason.err instanceof MysqlError) {
			reason.responseManager.setStatusCode(500)
				.setError({code: 'SERVER_ERR', message: 'An error occured while processing the request'});
		} else {
			reason.responseManager.setStatusCode(500)
				.setError({code: 'SERVER_ERR', message: reason.err.message});
		}
		reason.responseManager.end();
	});

});

/*
 *	Handle all the activity-type route requests
*/
router.all('/api/activity-type*', (req, res) => {
	activityTypeController.run(req, res).then(responseManager => {
		responseManager.end();
	}).catch(reason => {
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

/*
 *	Handle all the activity route requests
*/
router.all('/api/activity/*', (req, res) => {
	activityController.run(req, res).then(responseManager => {
		responseManager.end();
	}).catch(reason => {
		console.error(reason.err);
		if(reason.err instanceof InvalidFormatError) {
			reason.responseManager.setStatusCode(400)
				.setError({code: 'FORMAT_ERR', message: reason.err.message});
		} else if (reason.err instanceof UnauthorizedError){
			reason.responseManager.setStatusCode(403)	//Forbiden
				.setError({code: 'UNAUTHORIZED', message: 'You are not allowed to access this data'});
		} else {
			reason.responseManager.setStatusCode(500)
				.setError({code: 'SERVER_ERR', message: reason.err.message});
		}
		reason.responseManager.end();
	});
});

/*
 *	Handle the website part of the server
*/
router.get('/*', (req, res) => {
	
	// Pages that needs a token
	let protectedPages = [
		'/admin',
		'/sports'
	];
	
	let cookies = {};
	if(typeof req.headers["cookie"] !== 'undefined') {
		cookies = cookie.parse(req.headers["cookie"]);
	}

	// Redirects if token not set and page requested is protected
	if(!cookies.token && protectedPages.includes(req.url)) {
		res.statusCode = 302;
		res.setHeader('Location', '/login');
		res.end();
		return;
	}
	
	// Redirects user from login page to admin if token exists
	if(req.url == '/login' && cookies.token) {
		res.statusCode = 302;
		res.setHeader('Location', '/admin');
		res.end();
		return;
	}
	
	if (req.url === '/login' || req.url === '/') {
		req.url = '/index.html';
	} else if (req.url === '/admin') {
		req.url = '/admin.html';
	} else if (req.url === '/sports') {
		req.url = '/sports.html';
	}
	
	fs.readFile('./website' + req.url, (err, data) => {
		if(err) {
			res.statusCode = 404;
			fs.readFile('./website/error.html', (err, data) => {
				if(err) {
					res.end('Server error');
				}
				res.end(data);
			});
			return;
		}
		res.statusCode = 200;
		res.end(data);
	});
});

/*
 *	HTTP and HTTPS entrypoint
*/
let onServerRequest = (req, res) => {
	bodyManager.parse(req).then((body) => {
		req.body = body;
		router(req, res, err => {
			if(err) {
				console.error(err);
			}
		});
	}).catch(err => {
		console.error(err);
	});
};

http.createServer(onServerRequest).listen(80);

/*
 *	Tries to read SSL certificate if present
*/
let options = {};
try {
	options.key = fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/privkey.pem');
	options.cert = fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/cert.pem');
} catch(err) {
	console.error(err)
	console.error("Could not find SSL certificate files, server running under HTTP only");
}

https.createServer(options, onServerRequest).listen(443);

//Catch all uncaught exceptions and prevent the server from crashing
process.on('uncaughtException', err => {
	console.error(err);
});