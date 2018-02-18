var unirest = require('unirest');
var locks = require('locks');
var fs = require('fs');
var drinks = require('../lib/types');
var http = require('http');
var url = require('url');

function TestRes() {
	this._test_num = 0;
	this.mutex = locks.createMutex();
};

TestRes.prototype.testRes = function(desc, req, exp, act, pass) {
	var that = this;
	this.mutex.timedLock(10000, function(err) {
		if (err) {
			console.log("ERROR obtaining lock.");
		} else {
			that._test_num += 1;
			fs.appendFileSync('./results.txt', `${that._test_num}, ${desc}, ${req}, ${exp}, ${act}, ${pass}`);
			that.mutex.unlock();
		}
	});
};

var tests = {
	generalTest: {
		getDrinks: function(resObj, host) {
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/drinks')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /drinks endpoint', 'F', 200, res.code, 'fail');
					} else {
						var i = 0;
						var pass = true;
						var types = Object.keys(drinks);
						for (let type in res.body) {
							if (type != types[i] || res.body[type] != drinks[type]) {
								pass = false;
								break;
							}
							i += 1;
						}

						if (pass) {
							resObj.testRes('Test GET /drinks endpoint', 'F', 'res.body == drinkTypes', 'res.body == drinkTypes', 'pass');
						} else {
							resObj.testRes('Test GET /drinks endpoint', 'F', 'res.body == drinkTypes', 'res.body != drinkTypes', 'fail');
						}
					}
					resolve();
				});
			});
		},

		getNumOfTanks: function(resObj, host) {
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/numOfTanks')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /numOfTanks endpoint', 'F', 200, res.code, 'fail');
					} else {
						if (res.raw_body.trim() == '3') {
							resObj.testRes('Test GET /numOfTanks endpoint', 'F', 'res.raw_body == 3', 'res.raw_body == 3', 'pass');
						} else {
							resObj.testRes('Test GET /numOfTanks endpoint', 'F', 'res.raw_body == 3', 'res.raw_body != 3', 'fail');
						}
					}
					resolve();
				});
			});
		}
	},

	adminTest: {
		_creds: {
			userName: 'admin',
			password: 'admin'
		},

		updateCreds: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var data = {
					userName: 'admin_new',
					password: 'admin_new'
				};

				unirest.post(host + '/updateCreds')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.send(data)
				.end(function (res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /updateCreds endpoint', 'F', 200, res.code, 'fail');
						resolve();
					} else {
						unirest.post(host + '/updateCreds')
						.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
						.auth(data.userName, data.password)
						.send(that._creds)
						.end(function(res) {
							if (res.code < 200 || res.code > 299) {
								resObj.testRes('Test POST /updateCreds endpoint', 'F', 200, res.code, 'fail');
							} else {
								resObj.testRes('Test POST /updateCreds endpoint', 'F', 200, res.code, 'pass');
							}
							resolve();
						});
					}
				});
			});
		},

		login: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/login')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /login endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test POST /login endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		},

		setMap: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/map')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.attach('file', './map_test.txt')
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /map endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test POST /map endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		},

		getMap: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/map')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /map endpoint', 'F', 200, res.code, 'fail');
					} else {
						fs.readFile('./map_test.txt', 'utf8', function(err, contents) {
							if (err) {
								console.log('ERROR reading file.');
								resObj.testRes('Test GET /map endpoint', 'F', 'File contents == Map received', 'N/A', 'fail');
							} else {
								if (res.raw_body == contents) {
									resObj.testRes('Test GET /map endpoint', 'F', 'File contents == Map received', 'File contents == Map received', 'pass');
								} else {
									resObj.testRes('Test GET /map endpoint', 'F', 'File contents == Map received', 'File contents != Map received', 'fail');
								}
							}
						});
					}
					resolve();
				});
			});
		},

		deleteDrink: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.delete(host + '/drinks?name=COKE')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test DELETE /drinks endpoint', 'F', 200, res.code, 'fail');
						resolve();
					} else {
						unirest.get(host + '/drinks')
						.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
						.end(function(res) {
							if (res.code < 200 || res.code > 299) {
								resObj.testRes('Test DELETE /drinks endpoint', 'F', 200, res.code, 'fail');
							} else {
								if ('COKE' in res.body) {
									resObj.testRes('Test DELETE /drinks endpoint', 'F', 'Missing COKE', 'NOT missing COKE', 'fail');
								} else {
									resObj.testRes('Test DELETE /drinks endpoint', 'F', 'Missing COKE', 'Missing COKE', 'pass');
								}
							}
							resolve();
						});
					}
				});
			});
		},

		addDrink: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var data = {
					COKE: 1
				};

				unirest.post(host + '/drinks')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.send(data)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /drinks endpoint', 'F', 200, res.code, 'fail');
						resolve();
					} else {
						unirest.get(host + '/drinks')
						.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
						.end(function(res) {
							if (res.code < 200 || res.code > 299) {
								resObj.testRes('Test POST /drinks endpoint', 'F', 200, res.code, 'fail');
							} else {
								if ('COKE' in res.body) {
									resObj.testRes('Test POST /drinks endpoint', 'F', 'COKE in body', 'COKE in body', 'pass');
								} else {
									resObj.testRes('Test POST /drinks endpoint', 'F', 'COKE in body', 'COKE NOT in body', 'fail');
								}
							}
							resolve();
						});
					}
				});
			});
		}
	},

	clientTest: {
		_creds: {
			userName: 'admin',
			password: 'admin'
		},
		token: null,
		order_id: null,

		getToken: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/table?table_id=1')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(that._creds.userName, that._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /table endpoint', 'F', 200, res.code, 'fail');
					} else {
						if (!('token' in res.body) || !('token_type' in res.body)) {
							resObj.testRes('Test POST /table endpoint', 'F', '"token" and "token_type" in body', '"token" or "token_type" NOT in body', 'fail');
						} else {
							that.token = res.body.token;
							resObj.testRes('Test POST /table endpoint', 'F', '"token" and "token_type" in body', '"token" and "token_type" in body', 'fail');
						}
					}
					resolve();
				});
			});
		},

		placeOrder: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var data = {
					order: [
						{
							type: 'COKE'
						}
					]
				};

				unirest.post(host + '/placeOrder?table_id=1')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${that.token}`})
				.send(data)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /placeOrder endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test POST /placeOrder endpoint', 'F', 200, res.code, 'pass');
						that.order_id = res.body.orderData.order_id;
					}
					resolve();
				});
			});
		},

		placeInLine: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.get(host + `/placeInLine?table_id=1&order_id${that.order_id}`)
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${that.token}`})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /placeInLine endpoint', 'F', 200, res.code, 'fail');
					} else {
						if (res.raw_body == 1) {
							resObj.testRes('Test GET /placeInLine endpoint', 'F', 'res.raw_body == 1', 'res.raw_body == 1', 'pass');
						} else {
							resObj.testRes('Test GET /placeInLine endpoint', 'F', 'res.raw_body == 1', 'res.raw_body != 1', 'fail');
						}
					}
					resolve();
				});
			});
		},

		cancelOrder: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.delete(host + `/cancelOrder?table_id=1&order_id=${that.order_id}`)
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${that.token}`})
				.end(function(res){
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test DELETE /cancelOrder endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test DELETE /cancelOrder endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		}
	},

	robotTest: {
		token: null

		reqListenForToken: function(host) {
			var that = this;

			return new Promise(function(resolve, reject) {
				unirest.post(host + '/genToken')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.end(function(res) {
					console.log(res);
				});

				http.createServer(function(req, res) {
					var url = url.parse(req.url, true);
					if (req.method.toUpperCase() === 'POST' && url.pathname.toLowerCase().replace(/\//, '') === 'token') {
						var body = '';
						req.on('data', function(data) {
							body += data;
						});

						req.on('end', function() {
							try {
								jsonDict = JSON.stringify(data);
							} catch (e) {
								res.writeHead(500);
								res.end();
							}

							that.token = jsonDict.access_token;
							res.writeHead(200);
							res.end();
							resolve();
						});
					} else {
						res.writeHead(404);
						res.end();
					}
				}).listen(8000, '0.0.0.0');
			});
		},

		checkToken: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/checkToken')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${that.token}`})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /checkToken endpoint', 'F', 200, res.code, 'fail');
					} else {
						if (! ('valid' in res.body)) {
							resObj.testRes('Test GET /checkToken endpoint', 'F', 'Must return validity of token', 'Does not include validity of token', 'fail');
						} else {
							resObj.testRes('Test GET /checkToken endpoint', 'F', 'Must return validity of token', 'Includes validity of token', 'pass');
						}
					}
					resolve();
				});
			});
		},

		getMap: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/map')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${that.token}`})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /map endpoint', 'F', 200, res.code, 'fail');
					} else {
						fs.readFile('./map_test.txt', 'utf8', function(err, contents) {
							if (err) {
								console.log('ERROR reading file.');
								resObj.testRes('Test GET /map endpoint', 'F', 'File contents == Map received', 'N/A', 'fail');
							} else {
								if (res.raw_body == contents) {
									resObj.testRes('Test GET /map endpoint', 'F', 'File contents == Map received', 'File contents == Map received', 'pass');
								} else {
									resObj.testRes('Test GET /map endpoint', 'F', 'File contents == Map received', 'File contents != Map received', 'fail');
								}
							}
						});
					}
					resolve();
				});
			});
		},

		nextOrder: function(resObj, host) {
			var that = this;
			return new Promise(function(resolve, reject) {
				unirest.get('host' + '/nextOrder')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${that.token}`})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /nextOrder endpoint', 'F', 200, res.code, 'fail');
					} else {
						var i = 0;
						var keys = ['table_id', 'order_id', 'order'];
						var passed = true;

						for (let key in res.body) {
							if (!(key in keys)) {
								passed = false;
								break
							}
						}

						if (passed) {
							resObj.testRes('Test GET /nextOrder endpoint', 'F', 'Order should have all required keys', 'Order has all required keys', 'pass');
						} else {
							resObj.testRes('Test GET /nextOrder endpoint', 'F', 'Order should have all required keys', 'Order does not have all required keys', 'fail');
						}
					}
					resolve();
				});
			});
		}
	}
};

const IP = 'http://localhost:8080';
var resObj = new TestRes();

tests.generalTest.getDrinks(resObj, IP).then(function() {
	return tests.generalTest.getNumOfTanks(resObj, IP);
}).then(function() {
	return tests.adminTest.updateCreds(resObj, IP);
}).then(function() {
	return tests.adminTest.login(resObj, IP);
}).then(function() {
	return tests.adminTest.setMap(resObj, IP);
}).then(function() {
	return tests.adminTest.getMap(resObj, IP);
}).then(function() {
	return tests.adminTest.deleteDrink(resObj, IP);
}).then(function() {
	return tests.adminTest.addDrink(resObj, IP);
}).then(function() {
	return tests.clientTest.getToken(resObj, IP);
}).then(function() {
	return tests.clientTest.placeOrder(resObj, IP);
}).then(function() {
	return tests.clientTest.placeInLine(resObj, IP);
}).then(function() {
	return tests.clientTest.cancelOrder(resObj, IP);
}).then(function() {
	return tests.robotTest.reqListenForToken(IP);
}).then(function() {
	return tests.robotTest.checkToken(resObj, IP);
}).then(function() {
	return tests.robotTest.getMap(resObj, IP);
}).then(function() {
	return tests.robotTest.nextOrder(resObj, IP);
});

// TO RUN:
// on the server 'export BOT_HOST='localhost:8000''
// start node server
// On the server run the test script (this script)
// Should have a results.txt with results

// Can you please verify eveything passes, and debug why anything may fail (should be a problem with the test)
// Also can you please specify which requirement each test is for (i.e. F whatever)
