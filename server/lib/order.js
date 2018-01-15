const LOCKS = require('locks');

var mutex = LOCKS.createMutex();

//reset order counter to 0 each time server is started
function Order() {
	this.order_id = 0;
};

//method to produce next order_id once order verified
Order.prototype.getOrderNum = function(cb) {
	var that = this;
	mutex.timedLock(10000, function(err) {
		if (err) {
			return cb(err);
		}
		that.order_id += 1;
		mutex.unlock();
		cb(null, that.order_id);
	});
};

module.exports = Order;
