const http = require('http');
const https = require('https');
const fs = require('fs');
const Router = require('router');
const querystring = require('querystring');

const mysql = require('mysql');
const dbConfig = require('./config/dbConfig.js');

var router = new Router();

router.all('/token*', (req, res) => {
	try {
		const TokenController = require('./routes/token.js');
		let tokenController = new TokenController(req, res);
	} catch(err) {
		console.error(err);
	}
});

router.all('/user*', (req, res) => {
	try {
		const UserController = require('./routes/user.js');
		let userController = new UserController(req, res);
	} catch(err) {
		console.log(err);
	}
	
});

router.get('/', (req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.end("Hello World !");
});

http.createServer((req, res) => {
	router(req, res, () => {
		
	});
}).listen(80);

const options = {
	key: fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/privkey.pem'),
	cert : fs.readFileSync('/etc/letsencrypt/live/runscape.internet-box.ch/cert.pem')
}

https.createServer(options, (req, res) => {
	router(req, res, () => {
		
	});
}).listen(443);