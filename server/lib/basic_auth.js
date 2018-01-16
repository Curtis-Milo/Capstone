const LOCKS = require('locks');
const FS = require('fs');
const CRYPTO = require('crypto');
const TOKEN_GEN = require('rand-token');

const CREDS_PATH = './creds';
var mutex_auth = LOCKS.createMutex();

//create encrypted admin username/password pair and write it to filesystem
function BasicAuthManager() {
	this.sessManager = new SessionManager();
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
BasicAuthManager.prototype.checkAuth = function() {
	if (arguments.length === 3) {
		var that = this;
		var uName = arguments[0];
		var pw = arguments[1];
		var cb = arguments[2];
		mutex_auth.timedLock(10000, function(err) {
			if (err) {
				return cb(err);
			}

			var passed = that._hashedCreds === CRYPTO.createHash('md5').update(uName + ':' + pw).digest("hex");

			mutex_auth.unlock();
			cb(null, passed);
		});
	} else if (arguments.length === 2) {
		var token = arguments[0];
		var cb = arguments[1]
		this.sessManager.checkToken(token, cb);
	} else {
		cb('Invalid number of arguments.');
	}
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

BasicAuthManager.prototype.login = function(uName, pw, cb) {
	this.sessManager.startSession(function(err, token) {
		cb(err, token);
	});
};

BasicAuthManager.prototype.logout = function() {
	this.sessManager.endSession();
};

module.exports = BasicAuthManager;


function SessionManager() {
	this._token = null;
	this._timeout = null;
};

SessionManager.prototype.startSession = function(cb) {
	if (this._token) {
		clearTimeout(this._timeout);
	}

	this._token = TOKEN_GEN.generate(32);

	cb(null, this._token);

	this._timeout = setTimeout(function() {
		this._token = null;
	}, 60000);
};

SessionManager.prototype.endSession = function() {
	this._token = null;
	clearTimeout(this._timeout);
};

SessionManager.prototype.checkToken = function(token, cb) {
	if (this._token) {
		cb(null, token === this._token);

		clearTimeout(this._timeout);

		this._timeout = setTimeout(function() {
			this._token = null;
		}, 60000);
	}

	cb('No available session.');
};
