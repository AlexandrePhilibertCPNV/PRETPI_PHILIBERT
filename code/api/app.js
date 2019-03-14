const http = require('http');
const https = require('https');
const fs = require('fs');
const Router = require('router');
const querystring = require('querystring');
const mysql = require('mysql');

const dbConfig = require('./config/dbConfig.js');

var router = new Router();

router.all('/api/token*', (req, res) => {
	try {
		const TokenController = require('./routes/token.js');
		let tokenController = new TokenController(req, res);
	} catch(err) {
		console.error(err);
	}
});

router.all('/api/user*', (req, res) => {
	try {
		const UserController = require('./routes/user.js');
		let userController = new UserController(req, res);
	} catch(err) {
		console.log(err);
	}
	
});

router.all('/api/activityType*', (req, res) => {
	try {
		const ActivityTypeController = require('./routes/activityType.js');
		let activityTypeController = new ActivityTypeController(req, res);
	} catch(err) {
		console.log(err);
	}
});

router.all('/api/activity/*', (req, res) => {
	try {
		const ActivityController = require('./routes/activity.js');
		let activityController = new ActivityController(req, res);
	} catch(err) {
		console.log(err);
	}
});

router.get('/', (req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/text');
	res.end("API runscape");
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