const TOKEN_GEN = require('rand-token');
const LOCKS = require('locks');
const FS = require('fs');
const CRYPTO = require('crypto');

var mutexes = {};
const DIR = './tables';

//load all currently registerd tables from filesystem into JSON object
function TableManager() {
	this.hashedTokens = {};
	var that = this;
	if (! FS.existsSync(DIR)){
		FS.mkdirSync(DIR);
	} else {
		FS.readdir(DIR, function(err, files) {
			for (var file of files) {
				mutexes[file] = LOCKS.createMutex();
				var t = FS.readFileSync(DIR + '/' + file);
				that.hashedTokens[t] = file;
			}
		});
	}
};

//add a new table to filesystem and generate an
//authentication token specific to that table for
//communication with the server
TableManager.prototype.addTable = function(tableId, cb) {
	var newMutex = false;
	var that = this;

	if (! tableId) {
		return cb(new Error('No table_id specified.'));
	}

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

			that.hashedTokens[hash] = tableId.toString();

			mutexes[tableId].unlock();
			cb(null, token);
		});
	});
};

//verify that a given token for a specific table is correct
TableManager.prototype.checkToken = function(token, cb) {
	var hash = CRYPTO.createHash('md5').update(token).digest("hex");
	if (! (hash in this.hashedTokens)) {
		return cb(null, false, null);
	}

	var tableId = this.hashedTokens[hash];
	var that = this;

	mutexes[tableId].timedLock(10000, function(lockErr) {
		if (lockErr) {
			return cb(lockErr);
		}
		mutexes[tableId].unlock();
		cb(null, true, tableId);
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

	var that = this;

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
		
		var hash = null;

		for (let i in that.hashedTokens) {
			if (that.hashedTokens[i] == tableId.toString()) {
				hash = i;
				break;
			}
		}

		delete that.hashedTokens[hash];
		cb();
	});
};

module.exports = TableManager;
