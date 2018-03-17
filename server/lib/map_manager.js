const LOCKS = require('locks');
const FS = require('fs');

var mutex = LOCKS.createMutex();

const DIR = './map';
const MAP_PATH = DIR + '/map';
const TEMP_PATH = DIR + 'temp_map';

function _copy(source, target) {
	FS.createReadStream(source).pipe(FS.createWriteStream(target));
};

function _unlock() {
	mutex.unlock();
}

function MapManager() {
	this._tables = [];
	if (! FS.existsSync(DIR)){
		FS.mkdirSync(DIR);
		this.exists = false;
	} else if (FS.existsSync(MAP_PATH)) {
		this.exists = true;
		this._validate(FS.readFileSync(MAP_PATH));
	} else {
		this.exists = false;
	}
};

MapManager.prototype.getMap = function(cb) {
	if (! this.exists) {
		return cb('Map does not exist.', false, null);
	}
	mutex.timedLock(10000, function(lockErr) {
		if (lockErr) {
			return cb(lockErr);
		}

		var fileStream = FS.createReadStream(MAP_PATH);

		cb(null, fileStream, _unlock);
	});
};

MapManager.prototype._parse = function(dataMat) {
	for (let row of dataMat) {
		for (let element of row) {
			if (element == 'T') this._tables.push(this._tables.length);
		}
	}
};

MapManager.prototype._validate = function(data) {
	var rows = data.trim().split('\n');
	var i = 0;

	const VALID = ['0', 'T', 'H', 'X'];

	for (let row of rows) {
		row = row.trim().split(',');

		for (let element of row) {
			element = element.trim();

			if (VALID.indexOf(element) < 0) return false;
		}

		i++;
	}

	this._parse(dataMat);

	return true;
};

MapManager.prototype.setMap = function(stream, cb) {
	var that = this;
	mutex.timedLock(10000, function(lockErr) {
		if (lockErr) {
			return cb(lockErr);
		}

		var fileStream = FS.createWriteStream(TEMP_PATH);

		stream.pipe(fileStream);

		try {
			var data = FS.readFileSync(TEMP_PATH);

			 if (this._validate(data)) {
			 	_copy(TEMP_PATH, MAP_PATH);

				that.exists = true;

				cb();
			 } else {
			 	cb('Invalid map.');
			 }
		} catch(e) {
			cb(e);
		} finally {
			FS.unlinkSync(TEMP_PATH);
			mutex.unlock();
		}
	});
};

MapManager.prototype.getTables = function() {
	return this._tables;
};

module.exports = MapManager;
