const Router = require('router');

const DatabaseManager = require('../db/databaseManager.js');
const dbConfig = require('../config/dbConfig.js')
const {MissingFieldError} = require('../classes/error.js');

const tokenActions = require('../actions/token.js');

class TokenController {
	constructor(req, res) {
		let router = new Router();
		
		let dbManager = new DatabaseManager();
		let connection = dbManager.createConnection({
			host: 'localhost',
			user: dbConfig.user,
			password: dbConfig.password,
			port: 3306,
			insecureAuth: true,
			database: 'runscape'
		});
		
		connection.connect((err) => {
			if(err) {
				throw err;
			}
		});
		
		router.get('/token', (req, res) => {
			let body = '';
			req.on('data', (data) => {
				body += data.toString();
				
				// don't forget to limit data max size
			}).on('end', () => {
				let post;
				try {
					post = JSON.parse(body);
				} catch(err) {
					console.error(err);
				}
				if(typeof post.email === 'undefined' || typeof post.password === 'undefined') {
					res.statusCode = 401;
					res.end('missing email or password in request');
				}
				let emailCondition = {
					email: post.email
				};
				let passwordCondition = {
					password: post.password
				};
				connection.query('SELECT id FROM tbl_user WHERE ? AND ? LIMIT 1', [emailCondition, passwordCondition] ,(err, result) => {
					if(err) {
						throw err;
					}
					if(result.length === 0) {
						res.statusCode = 403;
						res.end('Login informations incorrect');
						return;
					}
					let token = tokenActions.createJWT(result[0]);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify({token: tokenActions.toString(token)}));
				});
			});
			
		});
		
		router(req, res, () => {
			
		});
	}
}

module.exports = TokenController;