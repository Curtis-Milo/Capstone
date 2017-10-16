const LOCKS = require('locks');
const HELPER = require('../lib/helper');

var mutex = LOCKS.createMutex();

function Queue() {
	this.queue = [];
};

Queue.prototype.push = function(data, cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			mutex.unlock();
			return cb(err);
		}
		that.queue = [data].concat(that.queue);
		mutex.unlock();
		cb(null, that.queue.length);
	});
};

Queue.prototype.pop = function(cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			mutex.unlock();
			return cb(err);
		}
		var element = that.queue.pop();
		mutex.unlock();
		cb(null, element);
	});
};

Queue.prototype.size = function() {
	return this.queue.length;
};

Queue.prototype.search = function(order_id, cb) {
	var that = this;
	var index = HELPER.binSearch(that.queue, order_id);
	if (index >= 0) {
		cb(null, (that.queue.length - index));
	} else {
		cb('order_id not in queue');
	}
};

Queue.prototype.delete = function(order_id, cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			mutex.unlock();
			return cb(err);
		}

		var index = HELPER.binSearch(that.queue, order_id);

		if (index >= 0) {
			that.queue.splice(index, 1);
			mutex.unlock();
			cb();
		} else {
			mutex.unlock();
			cb('order_id not in queue');
		}
	});
};

module.exports = Queue;
