const TOKEN_GEN = require('rand-token');
const LOCKS = require('locks');
const UNIREST = require('unirest');
const UTIL = require('util');
const FS = require('fs');
const CRYPTO = require('crypto');

var mutex = LOCKS.createMutex();

function TokenGen() {
	this._token = TOKEN_GEN.generate(32);
};

TokenGen.prototype.refresh = function(cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			mutex.unlock();
			cb(err);
		}
		that._token = TOKEN_GEN.generate(32);
		mutex.unlock();
		cb();
	});
};

TokenGen.prototype.checkToken = function(token, cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			mutex.unlock();
			return cb(err);
		}
		var passed = token === that._token;
		mutex.unlock();
		cb(null, passed);
	});
};

TokenGen.prototype.sendToken = function(host) {
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

module.exports.TokenGen = TokenGen;

const CREDS_PATH = './creds';
var mutex_auth = LOCKS.createMutex();

function BasicAuthManager() {
	if (FS.existsSync(CREDS_PATH)) {
		this._hashedCreds = FS.readFileSync(CREDS_PATH, 'utf8');
	} else {
		this._hashedCreds = CRYPTO.createHash('md5').update('admin:admin').digest("hex");
		FS.writeFile(CREDS_PATH, this._hashedCreds, function(err) {
			if (err) {
				console.log(err);
			}
		});
	}
};

BasicAuthManager.prototype.checkAuth = function(uName, pw, cb) {
	var that = this;
	mutex_auth.timedLock(10000, function(err) {
		if (err) {
			mutex_auth.unlock();
			return cb(err);
		}

		var passed = that._hashedCreds === CRYPTO.createHash('md5').update(uName + ':' + pw).digest("hex");

		mutex_auth.unlock();
		cb(null, passed);
	});
};

BasicAuthManager.prototype.update = function(uName, pw, cb) {
	var that = this;
	mutex_auth.timedLock(10000, function(err) {
		if (err) {
			mutex_auth.unlock();
			return cb(err);
		}

		that._hashedCreds = CRYPTO.createHash('md5').update(uName + ':' + pw).digest("hex");
		FS.writeFile(CREDS_PATH, that._hashedCreds, function(err) {
			mutex_auth.unlock();
			if (err) {
				return cb(err);
			}
			cb();
		});
	});
};

module.exports.BasicAuthManager = BasicAuthManager;
