const LOCKS = require('locks');
const UTIL = require('util');
const FS = require('fs');
const CRYPTO = require('crypto');

const CREDS_PATH = './creds';
var mutex_auth = LOCKS.createMutex();

//create encrypted admin username/password pair and write it to filesystem
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

//verify that username/password combination matches stored values
BasicAuthManager.prototype.checkAuth = function(uName, pw, cb) {
	var that = this;
	mutex_auth.timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}

		var passed = that._hashedCreds === CRYPTO.createHash('md5').update(uName + ':' + pw).digest("hex");

		mutex_auth.unlock();
		cb(null, passed);
	});
};

//update username/password combination in filesystem
BasicAuthManager.prototype.update = function(uName, pw, cb) {
	var that = this;
	mutex_auth.timedLock(10000, function(err) {
		if (err) {
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

module.exports = BasicAuthManager;
