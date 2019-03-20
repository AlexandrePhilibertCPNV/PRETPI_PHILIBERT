class RequestBodyManager {
	constructor() {
		this.MAX_BODY_LENGTH = 2e6;	// ~2Mb
	}
	
	parse(req) {
		return new Promise((resolve, reject) => {
			let body = '';
			req.on('data', chunk => {
				body += chunk.toString();
				
				if(body.length > this.MAX_BODY_LENGTH) {
					req.connection.destroy();
					reject(new Error('Request body too big'));
				}
			});
			req.on('end', () => {
				resolve(body);
			});
		});
	}
}

module.exports = RequestBodyManager;