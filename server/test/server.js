var unirest = require('unirest');
var locks = require('locks');

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
			unirest.get(host + '/drinks')
			.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
			.end(function(res) {
				if (res.code < 200 || res.code > 299) {
					resObj.testRes('Test GET /drinks endpoint', 'F', 200, res.code, 'fail');
				} else {
					resObj.testRes('Test GET /drinks endpoint', 'F', 200, res.code, 'pass');
				}
			});
		}
	},

	adminTest: {
		_creds: {
			userName: 'admin',
			password: 'admin'
		},

		updateCreds: function(resObj, host) {
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
			});
		},

		login: function(resObj, host) {
			unirest.post(host + '/login')
			.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
			.auth(this._creds.userName, this._creds.password)
			.end(function(res) {
				if (res.code < 200 || res.code > 299) {
					resObj.testRes('Test POST /login endpoint', 'F', 200, res.code, 'fail');
				} else {
					resObj.testRes('Test POST /login endpoint', 'F', 200, res.code, 'pass');
				}
			});
		},
	}
}
