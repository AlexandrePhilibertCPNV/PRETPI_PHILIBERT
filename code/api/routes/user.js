const querystring = require('querystring');
const Router = require('router');
const uuidv4 = require('uuid/v4');

const DatabaseManager = require('../db/databaseManager.js');
const {MysqlError} = require('../classes/error.js');
const userActions = require('../actions/user.js');
const tokenActions = require('../actions/token.js');
const dbConfig = require('../config/dbConfig.js');

class UserController {
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
		
		router.get('/user', (req, res) => {
			connection.query("select * from tbl_user", (err, result) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(result));
			});
		});
		
		router.get('/user/:id', (req, res) => {
			connection.query("SELECT * from tbl_user where id ='" + req.params.id + "' LIMIT 1", (err, result) => {
				if(err) {
					throw err;	
				}
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(result));
			});
		});
			
		router.post('/user', (req, res) => {
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
				userActions.create(post, (err, id) => {
					if(err) {
						if(err instanceof MysqlError) {
							res.statusCode = 500;
							res.end("Database Error");
						} else {
							res.statusCode = 500;
							res.end("Server error");
						}
					}
					res.statusCode = 200;
					res.end("user successfully created : " + id);
				});
			});
		});
		
		router.put('/user/:id', (req, res) => {
			
			let authorization = req.headers['authorization'];
			if(typeof authorization === 'undefined') {
				res.statusCode = 400;
				res.end('Access denied, token needed');
				return;
			}	
			let token = authorization.split('Bearer ').pop();
			if(typeof token === 'undefined') {
				res.statusCode = 400;
				res.end("token format invalid");
				return;
			}
			
			connection.query("select * from tbl_user where id ='" + req.params.id + "' LIMIT 1", (err, result) => {
				if(err) {
					throw new Error();
				}
				
				if(!tokenActions.validateJWT(token, result[0])) {
					res.statusCode = 401;
					res.end("Unauthorized");
				}
				
				let body = '';
				req.on('data', (data) => {
					body += data.toString();
					// don't forget to limit data max size
				});
				
				req.on('end', () => {
					let post = JSON.parse(body);
					userActions.update(req.params.id, post);
					res.statusCode = 200;
					res.end("user updated");
				});
			});
		});
		
		
		
		router(req, res, () => {
			
		});
	}
	
	
}

module.exports = UserController;