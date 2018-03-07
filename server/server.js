const HTTP = require('http');
const URL = require('url');
const QUEUE = require('./queue/queue');
const VERIF = require('./lib/verification');
const TOKEN_GEN = require('./lib/robot_auth');
const BASIC_AUTH = require('./lib/basic_auth');
const HELPER = require('./lib/helper');
const TABLE_MANAGER = require('./lib/table_mgmt');
const ORDER = require('./lib/order');
const FS = require('fs');
const LOCKS = require('locks');
const MAP_MANAGER = require('./lib/map_manager');

var mutex = LOCKS.createMutex();

var DRINKS = require('./lib/types');
const SIZES = require('./lib/sizes');

var queue = new QUEUE();
var order = new ORDER();
var tokenGen = new TOKEN_GEN();
var authManager = new BASIC_AUTH();
var tableManager = new TABLE_MANAGER();
var mapManager = new MAP_MANAGER();

const MAX_NUM_TYPES = 3;

var errors = 0;

function _parseCookies(cookies) {
	if (! cookies) return {};

	var ret = {};

	for (let cookie of cookies.split(';')) {
		var temp = cookie.split('=');

		ret[temp[0].trim()] = temp[1].trim();
	}

	return ret;
}

function _isInt(val) {
	return val.match(/^-{0,1}\d+$/) != null;
}

function _resolveRole(req, cb) {
	var roles = {
		robot: false,
		admin: false,
		client: false,
		is_sess: false
	};

	var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');
	var table_id = HELPER.caseInsensitiveKey(req.headers, 'table_id');
	var server_cookie = _parseCookies(req.headers.cookie).server_sessionId;

	authManager.checkAuth(server_cookie, function(sessErr, sessPassed) {
		if (! sessErr) {
			roles.admin = sessPassed;
			roles.is_sess = sessPassed;
		}

		if (auth) {
			var token = auth.trim().split(' ')[1];

			if (token) {
				tokenGen.checkToken(token, function(robotErr, robotPassed) {
					if (! robotErr) {
						roles.robot = robotPassed;
					}

					tableManager.checkToken(table_id, token, function(tableErr, tablePassed) {
						if (! tableErr) {
							roles.client = tablePassed;
						}

						var buf = new Buffer(token, 'base64');
						var plainAuth = buf.toString().split(':');

						authManager.checkAuth(plainAuth[0], plainAuth[1], function(adminErr, adminPassed) {
							if (! adminErr && ! roles.admin) {
								roles.admin = adminPassed;
							}

							cb(roles);
						});
					});
				});
			} else {
				cb(roles);
			}
		} else {
			cb(roles);
		}
	});
}

tokenGen.sendToken(process.env.BOT_HOST); // Define bot IP in environment

HTTP.createServer(function(req, res) {
	_resolveRole(req, function(roles) {
		var url = URL.parse(req.url, true);
		if (req.method.toUpperCase() === 'GET') {
			if (url.pathname.toLowerCase().replace(/\//, '') === 'placeinline') {
				if (roles.client || roles.admin) {
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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'nextorder') {
				if (roles.robot) {
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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'checktoken') {
				var resp_auth = {
					valid: roles.robot
				};

				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(resp_auth));
				res.end();
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'drinks') {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(DRINKS));
				res.end();
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'sizes') {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(SIZES));
				res.end();
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'numoftanks') {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(MAX_NUM_TYPES.toString());
				res.end();
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'map') {
				if (roles.admin || roles.robot) {
					mapManager.getMap(function(mapErr, stream, unlock) {
						if (mapErr) {
							res.writeHead(500, mapErr, {'Content-Type': 'text/html'});
							res.end();
							return;
						}
						res.writeHead(200, {'Content-Type': 'text/plain'});
						stream.pipe(res);
						unlock();
					});
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'errors') {
				if (roles.admin) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.write(errors.toString());
					res.end();
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else {
				res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
				res.end();
			}
		} else if (req.method.toUpperCase() === 'POST') {
			if (url.pathname.toLowerCase().replace(/\//, '') === 'placeorder') {
				if (roles.client) {
					var table_id = HELPER.caseInsensitiveKey(url.query, 'table_id');

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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
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
				if (roles.admin) {
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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'returntobase') {
				if (roles.admin) {
					// TODO: implement return to base function...
					res.writeHead(400, 'Not implemented yet...', {'Content-Type': 'text/html'});
					res.end();
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'login') {
				var auth = HELPER.caseInsensitiveKey(req.headers, 'authorization');

				if (! auth) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				var token = auth.trim().split(' ')[1];

				if (! token) {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
					return;
				}

				var buf = new Buffer(token, 'base64');
				var plainAuth = buf.toString().split(':');

				authManager.login(plainAuth[0], plainAuth[1], function(err, cookie) {
					if (err) {
						res.writeHead(500, err, {'Content-Type': 'text/html'});
						res.end();
						return;
					}

					if (! cookie) {
						res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
						res.end();
						return;
					}

					res.writeHead(200, {
						'Content-Type': 'text/html',
						'Set-Cookie': `server_sessionId=${cookie}`
					});
					res.end();
				});
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'logout') {
				if (roles.admin && roles.is_sess) {
					authManager.logout();
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.end();
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'errors') {
				if (roles.robot) {
					var body = '';
					req.on('data', function(data) {
						body += data;
					});

					req.on('end', function() {
						body = body.trim();

						if (_isInt(body)) {
							errors = parseInt(body);

							res.writeHead(200, {'Content-Type': 'application/json'});
							res.end();
						} else {
							res.writeHead(400, 'Invalid error code', {'Content-Type': 'application/json'});
							res.end();
						}
					});
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'table') {
				var table_id = HELPER.caseInsensitiveKey(url.query, 'table_id');

				if (roles.admin) {
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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'drinks') {
				if (roles.admin) {
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

						var tank_num = parseInt(jsonBody[Object.keys(jsonBody)[0]]);

						if (! tank_num || tank_num > MAX_NUM_TYPES || tank_num <= 0) {
							res.writeHead(400, `Tank number must be integer between 0 and ${MAX_NUM_TYPES}`, {'Content-Type': 'application/json'});
							res.end();
							return;
						} else if (HELPER.jsonVals(DRINKS).indexOf(tank_num) >= 0) {
							res.writeHead(400, `Tank ${tank_num} already in use.`, {'Content-Type': 'application/json'});
							res.end();
							return;
						}

						mutex.timedLock(10000, function(lockErr) {
							if (lockErr) {
								res.writeHead(500, lockErr, {'Content-Type': 'application/json'});
								res.end();
								return;
							}

							DRINKS[Object.keys(jsonBody)[0].toUpperCase()] = tank_num;

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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'map') {
				if (roles.admin) {
					mapManager.setMap(req, function(mapErr) {
						if (mapErr) {
							res.writeHead(500, mapErr, {'Content-Type': 'text/html'});
							res.end();
							return;
						}

						res.writeHead(200, 'Map uploaded!', {'Content-Type': 'text/html'});
						res.end();
					});
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else {
				res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
				res.end();
			}
		} else if (req.method.toUpperCase() === 'DELETE') {
			if (url.pathname.toLowerCase().replace(/\//, '') === 'cancelorder') {
				if (roles.client) {
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
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else if (url.pathname.toLowerCase().replace(/\//, '') === 'drinks') {
				if (roles.admin) {
					var name = HELPER.caseInsensitiveKey(url.query, 'name');
					mutex.timedLock(10000, function(lockErr) {
						if (lockErr) {
							res.writeHead(500, lockErr, {'Content-Type': 'application/json'});
							res.end();
							return;
						}

						delete DRINKS[name.toUpperCase()];

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
				} else {
					res.writeHead(401, 'Unauthorized', {'Content-Type': 'text/html'});
					res.end();
				}
			} else {
				res.writeHead(404, 'No such method', {'Content-Type': 'text/html'});
				res.end();
			}
		} else {
			res.writeHead(500, 'No such method', {'Content-Type': 'text/html'});
			res.end();
		}
	});
}).listen(8080, '0.0.0.0');
