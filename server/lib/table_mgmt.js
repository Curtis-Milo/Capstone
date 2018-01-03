const TOKEN_GEN = require('rand-token');
const LOCKS = require('locks');
const FS = require('fs');
const CRYPTO = require('crypto');

var mutex = LOCKS.createMutex();
const DIR = './tables' 

function TableManager() {
	if (! FS.existsSync(DIR)){
		FS.mkdirSync(DIR);
	}
};

TableManager.prototype.addTable = function(tableId, cb) {
	var path = DIR + '/' + tableId.toString();
	var token = TOKEN_GEN.generate(32);
	var hash = CRYPTO.createHash('md5').update(token).digest("hex");
	if (FS.existsSync(path)) {
		FS.unlinkSync(path);
	}

	FS.writeFile(path, hash, function(err) {
		if (err) {
			return cb(err);
		}

		cb(null, token);
	});
};

TableManager.prototype.checkToken = function(tableId, token, cb) {
	var path = DIR + '/' + tableId.toString();

	FS.readFile(path, function(err, hash) {
		if (err) {
			return cb(err);
		}

		cb(null, CRYPTO.createHash('md5').update(token).digest("hex") === hash);
	});
};

TableManager.prototype.availableTables = function(cb) {
	FS.readdir(DIR, function(err, files) {
		if (err) {
			return cb(err);
		}

		cb(null, files);
	});
};
