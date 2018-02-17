var unirest = require('unirest');
var locks = require('locks');
var fs = require('fs');
var drinks = require('../lib/types');

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
var resObj = TestRes();

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
		
	}
};
