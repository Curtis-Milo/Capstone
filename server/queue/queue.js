const LOCKS = require('locks');
const HELPER = require('../lib/helper');

var mutex = LOCKS.createMutex();

//instantiate an empty queue each time the server is started
function Queue() {
	this.queue = [];
};

//push new order to end of queue and return the place in line
Queue.prototype.push = function(data, cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}

		var temp = HELPER.sortOnAttr(that.queue, 'table_id');
		var index = HELPER.binSearch(temp, data.table_id, 'table_id');

		if (index < 0) {
			that.queue = [data].concat(that.queue);
			mutex.unlock();
			cb(null, that.queue.length);
		} else {
			var newIndex = HELPER.binSearch(that.queue, temp[index].order_id, 'order_id');

			that.queue[newIndex].order = HELPER.simplifyOrder(that.queue[newIndex].order.concat(data.order));

			mutex.unlock();
			cb(null, that.queue.length);
		}
	});
};

//pop the first element from the queue once it has been served
Queue.prototype.pop = function(cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}
		var element = that.queue.pop();
		mutex.unlock();
		cb(null, element);
	});
};

//
Queue.prototype.size = function() {
	return this.queue.length;
};

//search for order within the queue given an table_id
Queue.prototype.search = function(table_id, cb) {
	var temp = HELPER.sortOnAttr(this.queue, 'table_id');
	var index = HELPER.binSearch(temp, table_id, 'table_id');

	if (index < 0) {
		return cb(`table_id: ${table_id} not in queue`);
	}

	var order_id = temp[index].order_id;

	var newIndex = HELPER.binSearch(this.queue, order_id, 'order_id');

	cb(null, (this.queue.length - newIndex));
};

//delete specific order from the queue given an table_id
Queue.prototype.delete = function(table_id, cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}

		var temp = HELPER.sortOnAttr(that.queue, 'table_id');
		var index = HELPER.binSearch(temp, table_id, 'table_id');

		if (index < 0) {
			mutex.unlock();
			return cb('table_id not in queue');
		}

		var order_id = temp[index].order_id;

		var newIndex = HELPER.binSearch(that.queue, order_id, 'order_id');

		that.queue.splice(newIndex, 1);
		mutex.unlock();
		cb();
	});
};

module.exports = Queue;
