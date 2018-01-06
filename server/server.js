const HTTP = require('http');
const URL = require('url');
const QUEUE = require('./queue/queue');
const VERIF = require('./lib/verification');
const SECURITY = require('./lib/security');
const HELPER = require('./lib/helper');
const TABLE_MANAGER = require('./lib/table_mgmt');
const FS = require('fs');
const LOCKS = require('locks');

var mutex = LOCKS.createMutex();

var DRINKS = require('./lib/types');
const SIZES = require('./lib/sizes');

var queue = new QUEUE();
var order = new VERIF.Order();
var tokenGen = new SECURITY.TokenGen();
var authManager = new SECURITY.BasicAuthManager();
var tableManager = new TABLE_MANAGER.TableManager();

const MAX_NUM_TYPES = 3;

tokenGen.sendToken(process.env.BOT_HOST); // Define bot IP in environment

HTTP.createServer(function(req, res) {
	var url = URL.parse(req.url, true);
	if (req.method.toUpperCase() === 'GET') {
		if (url.pathname.toLowerCase().replace(/\//, '') === 'placeinline') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');
			var table_id = HELPER.caseInsensitiveKey(url.query, 'table_id');

			if (! auth || ! table_id) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			tableManager.checkToken(table_id, token, function(authErr, passed) {
				if (authErr) {
					res.writeHead(500, authErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				} else if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}
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
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'drinks') {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write(JSON.stringify(DRINKS));
			res.end();
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'sizes') {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write(JSON.stringify(SIZES));
			res.end();
		} else {
			res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	} else if (req.method.toUpperCase() === 'POST') {
		if (url.pathname.toLowerCase().replace(/\//, '') === 'placeorder') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');
			var table_id = HELPER.caseInsensitiveKey(url.query, 'table_id');

			if (! auth || ! table_id) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			tableManager.checkToken(table_id, token, function(authErr, passed) {
				if (authErr) {
					res.writeHead(500, authErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				} else if (! passed) {
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

					VERIF.checkData(body, order, table_id, function(err, newData) {
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
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'gentoken') {
			tokenGen.refresh(function(err) {
				if (err) {
					res.writeHead(500, err, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				tokenGen.sendToken(process.env.BOT_HOST);

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
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'login') {
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
					res.writeHead(500, err, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				res.writeHead(200, 'Logged in', {'Content-Type': 'text/html'});
				res.end();
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'errors') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'application/json'});
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
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'application/json'});
					res.end();
				}

				var body = '';
				req.on('data', function(data) {
					body += data;
				});

				req.on('end', function() {
					// TODO: Handle POST body

					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end();
				});
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'table') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');
			var table_id = HELPER.caseInsensitiveKey(url.query, 'table_id');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'application/json'});
				res.end();
				return;
			}

			if (! table_id) {
				res.writeHead(400, 'Missing table_id', {'Content-Type': 'application/json'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			var buf = new Buffer(token, 'base64');
			var plainAuth = buf.toString().split(':');

			authManager.checkAuth(plainAuth[0], plainAuth[1], function(err, passed) {
				if (err) {
					res.writeHead(500, err, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				tableManager.addTable(table_id, function(addErr, token) {
					if (addErr) {
						res.writeHead(500, addErr, {'Content-Type': 'text/html'});
						res.end();
						return;
					}

					res.writeHead(200, {'Content-Type': 'application/json'});
					res.write(JSON.stringify({
						token: token,
						token_type: 'bearer'
					}));
					res.end();
				});
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'drinks') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'application/json'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			var buf = new Buffer(token, 'base64');
			var plainAuth = buf.toString().split(':');

			authManager.checkAuth(plainAuth[0], plainAuth[1], function(err, passed) {
				if (err) {
					res.writeHead(500, err, {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				if (Object.keys(DRINKS).length >= MAX_NUM_TYPES) {
					res.writeHead(400, 'Max number of types of drinks already set.', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				var body = '';
				req.on('data', function(data) {
					body += data;
				});

				req.on('end', function() {
					try {
						jsonBody = JSON.parse(body);
					} catch (e) {
						res.writeHead(500, e, {'Content-Type': 'application/json'});
						res.end();
						return;
					}

					if (Object.keys(jsonBody).length != 1) {
						res.writeHead(400, 'Can only add one type at a time', {'Content-Type': 'application/json'});
						res.end();
						return;
					}

					mutex.timedLock(10000, function(lockErr) {
						if (lockErr) {
							res.writeHead(500, lockErr, {'Content-Type': 'application/json'});
							res.end();
							return;
						}

						DRINKS[Object.keys(jsonBody)[0]] = jsonBody[Object.keys(jsonBody)[0]];

						FS.writeFile('./lib/types.json', JSON.stringify(DRINKS), function(writeErr) {
							mutex.unlock();
							if (writeErr) {
								res.writeHead(500, writeErr, {'Content-Type': 'application/json'});
								res.end();
								return;
							}
							res.writeHead(200, {'Content-Type': 'application/json'});
							res.end();
						});
					});
				});
			});
		} else {
			res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	} else if (req.method.toUpperCase() === 'DELETE') {
		if (url.pathname.toLowerCase().replace(/\//, '') === 'cancelorder') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');
			var table_id = HELPER.caseInsensitiveKey(url.query, 'table_id');

			if (! auth || ! table_id) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			tableManager.checkToken(table_id, token, function(authErr, passed) {
				if (authErr) {
					res.writeHead(500, authErr, {'Content-Type': 'text/html'});
					res.end();
					return;
				} else if (! passed) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}
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
			});
		} else if (url.pathname.toLowerCase().replace(/\//, '') === 'drinks') {
			var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

			if (! auth) {
				res.writeHead(401, 'Unauthorized', {'Content-Type': 'application/json'});
				res.end();
				return;
			}

			var token = auth.trim().split(' ')[1];

			var buf = new Buffer(token, 'base64');
			var plainAuth = buf.toString().split(':');

			authManager.checkAuth(plainAuth[0], plainAuth[1], function(err, passed) {
				if (err) {
					res.writeHead(500, err, {'Content-Type': 'text/html'});
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
						jsonBody = JSON.parse(body);
					} catch (e) {
						res.writeHead(500, e, {'Content-Type': 'application/json'});
						res.end();
						return;
					}

					mutex.timedLock(10000, function(lockErr) {
						if (lockErr) {
							res.writeHead(500, lockErr, {'Content-Type': 'application/json'});
							res.end();
							return;
						}

						if (! jsonBody.name) {
							res.writeHead(400, 'Missing common name of drink type', {'Content-Type': 'application/json'});
							res.end();
							return;
						}

						delete DRINKS[jsonBody.name];

						FS.writeFile('./lib/types.json', JSON.stringify(DRINKS), function(writeErr) {
							mutex.unlock();
							if (writeErr) {
								res.writeHead(500, writeErr, {'Content-Type': 'application/json'});
								res.end();
								return;
							}
							res.writeHead(200, {'Content-Type': 'application/json'});
							res.end();
						});
					});
				});
			});
		} else {
			res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	} else {
		res.writeHead(500, 'No such method', {'Content-Type': 'text/html'});
		res.end();
	}
}).listen(8080, '0.0.0.0');
