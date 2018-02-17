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

var tests = {
	_ip: 'localhost:8080',
	adminTest: {
		_creds: {
			userName: 'admin',
			password: 'admin'
		},
		updateCreds: function(resObj) {
			_test_num += 1;
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
					resObj.testRes('Test /updateCreds endpoint', 'F', 200, res.code, 'fail');
				} else {
					unirest.post(host + '/updateCreds')
					.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
					.auth(data.userName, data.password)
					.send(this._creds)
					.end(function (res) {
						if (res.code < 200 || res.code > 299) {
							resObj.testRes('Test /updateCreds endpoint', 'F', 200, res.code, 'fail');
						} else {
							resObj.testRes('Test /updateCreds endpoint', 'F', 200, res.code, 'pass');
						}
					});
				}
			});
		}
	}
}
