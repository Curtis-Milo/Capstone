var unirest = require('unirest');
var locks = require('locks');
var fs = require('fs');

function TestRes() {
	this._test_num = 0;
	this.mutex = locks.createMutex();
};

TestRes.prototype.testRes = function(desc, req, exp, act, pass) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			console.log("ERROR obtaining lock.");
		} else {
			that._test_num += 1;
			// body...
			mutex.unlock();
		}
	});
};

const IP = 'http://localhost:8080';

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
						resObj.testRes('Test GET /drinks endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		},

		sizes: function(resObj, host) {
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/sizes')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test GET /sizes endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test GET /sizes endpoint', 'F', 200, res.code, 'pass');
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
						resObj.testRes('Test GET /numOfTanks endpoint', 'F', 200, res.code, 'pass');
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
			return new Promise(function(resolve, reject) {
				var data = {
					userName: 'admin_new',
					password: 'admin_new'
				};

				unirest.post(host + '/updateCreds')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
				.send(data)
				.end(function (res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /updateCreds endpoint', 'F', 200, res.code, 'fail');
					} else {
						unirest.post(host + '/updateCreds')
						.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
						.auth(data.userName, data.password)
						.send(this._creds)
						.end(function(res) {
							if (res.code < 200 || res.code > 299) {
								resObj.testRes('Test POST /updateCreds endpoint', 'F', 200, res.code, 'fail');
							} else {
								resObj.testRes('Test POST /updateCreds endpoint', 'F', 200, res.code, 'pass');
							}
						});
					}
					resolve();
				});
			});
		},

		login: function(resObj, host) {
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/login')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
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
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/map')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
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
			return new Promise(function(resolve, reject) {
				unirest.get(host + '/map')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
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
									resObj.testRes('Test GET /map endpoint', 'F', 200, res.code, 'pass');
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
			return new Promise(function(resolve, reject) {
				unirest.delete(host + '/drinks?name=COKE')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test DELETE /map endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test DELETE /map endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		},

		addDrink: function(resObj, host) {
			
		},

		errors: function(resObj, host) {
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/ta?name=COKE')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test DELETE /map endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test DELETE /map endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		},

		table: function(resObj, host) {
			return new Promise(function(resolve, reject) {
				unirest.post(host + '/table?table_id=2')
				.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
				.auth(this._creds.userName, this._creds.password)
				.end(function(res) {
					if (res.code < 200 || res.code > 299) {
						resObj.testRes('Test POST /table endpoint', 'F', 200, res.code, 'fail');
					} else {
						resObj.testRes('Test POST /table endpoint', 'F', 200, res.code, 'pass');
					}
					resolve();
				});
			});
		}
	},

	queueTest: {
		//test placing an order,place in line, cancel order, next order call
		//will need table credentials
	}
}
