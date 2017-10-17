const HTTP = require('http');
const URL = require('url');
const QUEUE = require('./queue/queue');
const VERIF = require('./lib/verification');
const SECURITY = require('./lib/security');
const HELPER = require('./lib/helper');

var queue = new QUEUE();
var order = new VERIF.Order();
var tokenGen = new SECURITY.TokenGen();
var authManager = new SECURITY.BasicAuthManager();

tokenGen.sendToken(process.env.BOT_HOST); // Define bot IP in environment

HTTP.createServer(function(req, res) {
	var url = URL.parse(req.url, true);
	if (req.method.toUpperCase() === 'GET') {
		if (url.pathname.toLowerCase().replace(/\//, '') === 'placeinline') {
			var order_id = HELPER.caseInsensitiveKey(url.query, 'order_id');
			queue.search(order_id, function(err, placeInLine) {
				if (err) {
					res.writeHead(404, err, {'Content-Type': 'text/html'});
					res.end();
				} else {
					res.writeHead(200, {'Content-Type': 'text/html'});
					res.write(placeInLine.toString());
					res.end();
				}
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'nextorder') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			tokenGen.checkToken(token, function(tokenErr, passed) {
				if (tokenErr) {
					res.writeHead(500, tokenErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				queue.pop(function(err, data) {
					if (err) {
						res.writeHead(500, err, {'Content-Type': 'text/html'});
						res.end();
					} else {
						if (! data) {
							res.writeHead(404, 'No jobs to serve', {'Content-Type': 'text/html'});
							res.end();
						} else {
							res.writeHead(200, {'Content-Type': 'application/json'});
							res.write(JSON.stringify(data));
							res.end();
						}
					}
				});
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'checktoken') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');
			var resp_auth = {
				valid: true
			};

			if (! auth) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				resp_auth.valid = false;
				res.write(JSON.stringify(resp_auth));
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			tokenGen.checkToken(token, function(tokenErr, passed) {
				if (tokenErr) {
					res.writeHead(500, tokenErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					resp_auth.valid = false;
				}

				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(resp_auth));
				res.end();
			});
		} else {
			res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	} else if (req.method.toUpperCase() === 'POST') {
		if (url.pathname.toLowerCase().replace(/\//, '') === 'placeorder') {
			var body = '';
			req.on('data', function(data) {
				body += data;
			});

			req.on('end', function() {
				try {
					body = JSON.parse(body);
				} catch (e) {
					res.writeHead(500, 'Invalid body', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				VERIF.checkData(body, order, function(err, newData) {
					if (err) {
						res.writeHead(500, err, {'Content-Type': 'text/html'});
						res.end();
						return;
					}

					queue.push(newData, function(queueErr, placeInLine) {
						if (queueErr) {
							res.writeHead(500, queueErr, {'Content-Type': 'text/html'});
							res.end();
							return;
						}
						res.writeHead(200, {'Content-Type': 'application/json'});
						res.write(JSON.stringify({
							placeInLine: placeInLine,
							orderData: newData
						}));
						res.end();
					});
				});
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'gentoken') {
			tokenGen.refresh(function(err) {
				if (err) {
					res.writeHead(500, err, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				tokenGen.sendToken();

				res.writeHead(200);
				res.end();
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'updatecreds') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			var buf = new Buffer(token, 'base64');
			var plainAuth = buf.toString().split(':');

			authManager.checkAuth(plainAuth[0], plainAuth[1], function(err, passed) {
				if (err) {
					res.writeHead(500, tokenErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				var body = '';
				req.on('data', function(data) {
					body += data;
				});

				req.on('end', function() {
					try {
						body = JSON.parse(body);
					} catch (e) {
						res.writeHead(500, 'Invalid body', {'Content-Type': 'text/html'});
						res.end();
						return;
					}

					var newUser = HELPER.caseInsensitiveKey(body, 'username');
					var newPass = HELPER.caseInsensitiveKey(body, 'password');

					if (! newUser || ! newPass) {
						res.writeHead(500, 'Missing credentials', {'Content-Type': 'text/html'});
						res.end();
						return;
					}

					authManager.update(newUser, newPass, function(updateErr) {
						if (updateErr) {
							res.writeHead(500, updateErr, {'Content-Type': 'text/html'});
							res.end();
							return;
						}

						res.writeHead(200);
						res.end();
					});
				});
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'returntobase') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			var buf = new Buffer(token, 'base64');
			var plainAuth = buf.toString().split(':');

			authManager.checkAuth(plainAuth[0], plainAuth[1], function(err, passed) {
				if (err) {
					res.writeHead(500, tokenErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				// TODO: implement return to base function...
				res.writeHead(400, 'Not implemented yet...', {'Content-Type': 'text/html'});
				res.end();
			});
		} else {
			res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	} else if (req.method.toUpperCase() === 'DELETE') {
		if (url.pathname.toLowerCase().replace(/\//, '') === 'cancelorder') {
			var order_id = HELPER.caseInsensitiveKey(url.query, 'order_id');
			queue.delete(order_id, function(err) {
				if (err) {
					res.writeHead(500, err, {'Content-Type': 'text/html'});
					res.end();
				} else {
					res.writeHead(200);
					res.end();
				}
			});
		} else {
			res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	} else {
		res.writeHead(500, 'No such method', {'Content-Type': 'text/html'});
		res.end();
	}
}).listen(8080);
