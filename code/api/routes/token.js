const Router = require('router');

const dbConfig = require('../config/dbConfig.js')
const {MissingFieldError} = require('../classes/error.js');
const ResponseManager = require('../classes/responseManager.js');
const tokenActions = require('../actions/token.js');
const userActions = require('../actions/user.js');

class TokenController {
	constructor() {

	}
	
	run(req, res) {
		return new Promise((resolve, reject) => {
			let router = new Router();
			let responseManager = new ResponseManager(res);
			
			router.post('/api/token', (req, res) => {
				let body = JSON.parse(req.body);
				
				//Field verification
				if(typeof body.email === 'undefined') {
					let reason = {
						err: new MissingFieldError('Missing email in request body'),
						responseManager: responseManager
					};
					reject(reason);
				}
				if(typeof body.password === 'undefined') {
					let reason = {
						err: new MissingFieldError('Missing password in request body'),
						responseManager: responseManager
					};
					reject(reason);
				}

				//Authentication and JWT creation
				userActions.login(body.email, body.password).then(result => {
					let token = tokenActions.createJWT(result[0]);
					let returnedToken = {token: tokenActions.toString(token)}
					responseManager.addData(returnedToken);
					resolve(responseManager);
				}).catch(err => {
					let reason = {
						err: err,
						responseManager: responseManager
					};
					reject(reason);
				});
			});
			
			router(req, res, (err) => {
			
			});
		});
	}
}

module.exports = TokenController;