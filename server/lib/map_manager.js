const LOCKS = require('locks');
const FS = require('fs');
const HELPER = require('./helper');

var mutex = LOCKS.createMutex();

const DIR = './map';
const MAP_PATH = DIR + '/map';
const TEMP_PATH = DIR + '/temp_map';

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
		this._validate(FS.readFileSync(MAP_PATH, 'utf8'));
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
	this._tables = [];
	for (let row of dataMat) {
		for (let element of row) {
			if (element == 'T') this._tables.push(this._tables.length);
		}
	}
};

MapManager.prototype._validate = function(data) {
	var dataMat = [];
	var rows = data.trim().split('\n');
	var dim = rows[0].trim().split(',');
	rows = rows.splice(1);

	for (var j in dim) {
		dim[j] = dim[j].trim();
		if (! HELPER._isInt(dim[j])) return false;
		dim[j] = parseInt(dim[j]);
	}

	if (dim.length != 2 || dim[0] != rows.length) return false;

	var i = 0;

	const VALID = ['0', 'T', 'H', 'X'];

	for (let row of rows) {
		row = row.trim().split(',');
		dataMat.push([]);

		if (dim[1] != row.length) return false;

		for (let element of row) {
			element = element.trim();
			dataMat[i].push(element);

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

		stream.pipe(fileStream).on('finish', function() {
			try {
				var data = FS.readFileSync(TEMP_PATH, 'utf8');

				 if (that._validate(data)) {
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
	});
};

MapManager.prototype.getTables = function() {
	return this._tables;
};

module.exports = MapManager;
