const TOKEN_GEN = require('rand-token');
const LOCKS = require('locks');
const FS = require('fs');
const CRYPTO = require('crypto');

var mutexes = {};
const DIR = './tables';

//load all currently registerd tables from filesystem into JSON object
function TableManager() {
	if (! FS.existsSync(DIR)){
		FS.mkdirSync(DIR);
	} else {
		FS.readdir(DIR, function(err, files) {
			for (var file of files) {
				mutexes[file] = LOCKS.createMutex();
			}
		});
	}
};

//add a new table to filesystem and generate an
//authentication token specific to that table for
//communication with the server
TableManager.prototype.addTable = function(tableId, cb) {
	var newMutex = false;
	if (! (tableId in mutexes)) {
		mutexes[tableId] = LOCKS.createMutex();
		newMutex = true;
	}

	mutexes[tableId].timedLock(10000, function(lockErr) {
		if (lockErr) {
			if (newMutex) {
				delete mutexes[tableId];
			}
			return cb(lockErr);
		}
	
		var path = DIR + '/' + tableId.toString();
		var token = TOKEN_GEN.generate(32);
		var hash = CRYPTO.createHash('md5').update(token).digest("hex");

		FS.writeFile(path, hash, function(err) {
			if (err) {
				mutexes[tableId].unlock();
				delete mutexes[tableId];
				return cb(err);
			}

			mutexes[tableId].unlock();
			cb(null, token);
		});
	});
};

//verify that a given token for a specific table is correct
TableManager.prototype.checkToken = function(tableId, token, cb) {
	if (! (tableId in mutexes)) {
		return cb(new Error('Invalid tableId'));
	}

	mutexes[tableId].timedLock(10000, function(lockErr) {
		if (lockErr) {
			return cb(lockErr);
		}
		var path = DIR + '/' + tableId.toString();

		FS.readFile(path, function(err, hash) {
			if (err) {
				mutexes[tableId].unlock();
				return cb(err);
			}

			mutexes[tableId].unlock();
			cb(null, CRYPTO.createHash('md5').update(token).digest("hex") === hash);
		});
	});
};

//find all available tables
TableManager.prototype.availableTables = function(cb) {
	FS.readdir(DIR, function(err, files) {
		if (err) {
			return cb(err);
		}

		cb(null, files);
	});
};

//remove a table from the filesystem
TableManager.prototype.deleteTable = function(tableId, cb) {
	if (! (tableId in mutexes)) {
		return cb(new Error('Invalid tableId'));
	}

	mutexes[tableId].timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}

		var path = DIR + '/' + tableId.toString();

		if (FS.existsSync(path)) {
			FS.unlinkSync(path);
		}
		
		mutexes[tableId].unlock();
		delete mutexes[tableId];
		cb();
	});
};

module.exports = TableManager;
