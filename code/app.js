const http = require('http');
const https = require('https');
const fs = require('fs');
const Router = require('router');
const querystring = require('querystring');
const mysql = require('mysql');

const dbConfig = require('./api/config/dbConfig.js');

var router = new Router();

router.all('/api/token*', (req, res) => {
	try {
		const TokenController = require('./api/routes/token.js');
		let tokenController = new TokenController(req, res);
	} catch(err) {
		console.error(err);
	}
});

router.all('/api/user*', (req, res) => {
	try {
		const UserController = require('./api/routes/user.js');
		let userController = new UserController(req, res);
	} catch(err) {
		console.log(err);
	}
	
});

router.all('/api/activityType*', (req, res) => {
	try {
		const ActivityTypeController = require('./api//routes/activityType.js');
		let activityTypeController = new ActivityTypeController(req, res);
	} catch(err) {
		console.log(err);
	}
});

router.all('/api/activity/*', (req, res) => {
	try {
		const ActivityController = require('./api//routes/activity.js');
		let activityController = new ActivityController(req, res);
	} catch(err) {
		console.log(err);
	}
});

router.get('/*', (req, res) => {
	if(req.url === '/login') {
		req.url = '/index.html';
	}
	
	fs.readFile('./website' + req.url, (err, data) => {
		if(err) {
			res.statusCode = 404;
			res.end();
		}
		res.statusCode = 200;
		res.end(data);
	});
});

http.createServer((req, res) => {
	router(req, res, () => {
		
	});
}).listen(80);

let options = {};
try {
	options.key = fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/privkey.pem');
	options.cert = fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/cert.pem');
} catch(err) {
	console.log(err)
	console.log("Could not find SSL certificate files, server running under HTTP only");
}

https.createServer(options, (req, res) => {
	router(req, res, () => {
		
	});
}).listen(443);