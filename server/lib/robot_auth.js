const TOKEN_GEN = require('rand-token');
const LOCKS = require('locks');
const UNIREST = require('unirest');

var mutex = LOCKS.createMutex();

//generate a new token
function TokenGen() {
	this._token = TOKEN_GEN.generate(32);
};

//re-generate token
TokenGen.prototype.refresh = function(cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			cb(err);
		}
		that._token = TOKEN_GEN.generate(32);
		mutex.unlock();
		cb();
	});
};

//verify that a given token matches generated token
TokenGen.prototype.checkToken = function(token, cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}
		var passed = token === that._token;
		mutex.unlock();
		cb(null, passed);
	});
};

//send generated token to robot
TokenGen.prototype.sendToken = function(host) {
	if (! host.startsWith('http')) {
		host = 'http' + host;
	}
	var data = {
		token_type: 'bearer',
		access_token: this._token
	};
	UNIREST.post(host + '/') // TODO: figure out proper endpoint for bot
	.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
	.send(data)
	.end(function(res) {
		console.log(UTIL.inspect(res, false, null));
	});
};

module.exports = TokenGen;