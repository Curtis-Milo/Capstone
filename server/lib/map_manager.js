const LOCKS = require('locks');
const FS = require('fs');

var mutex = LOCKS.createMutex();

const DIR = './map';
const MAP_PATH = DIR + '/map';

function MapManager() {
	if (! FS.existsSync(DIR)){
		FS.mkdirSync(DIR);
		this.exists = false;
	} else if (FS.existsSync(MAP_PATH)) {
		this.exists = true;
	} else {
		this.exists = false;
	}
};

MapManager.prototype.getMap = function(cb) {
	if (! this.exists) {
		return cb(null, false, null);
	}
	mutex.timedLock(10000, function(lockErr) {
		if (lockErr) {
			return cb(lockErr);
		}

		var fileStream = FS.createReadStream(MAP_PATH);

		cb(null, fileStream, mutex.unlock);
	});
};

MapManager.prototype.setMap = function(stream, cb) {
	var that = this;
	mutex.timedLock(10000, function(lockErr) {
		if (lockErr) {
			return cb(lockErr);
		}

		var fileStream = FS.createWriteStream(MAP_PATH);

		stream.pipe(fileStream);

		that.exists = true;

		mutex.unlock();
		cb();
	});
};

module.exports = MapManager;
