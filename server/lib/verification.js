const LOCKS = require('locks');
const SIZES = require('./sizes');
const TYPES = require('./types');
const HELPER = require('./helper');

var mutex = LOCKS.createMutex();

var _jsonVals = function(obj) {
	var ret = [];
	for (let i of Object.keys(obj)) {
		ret.push(obj[i]);
	}
	return ret;
};

//verification that orders sent to server contain necessary
//information amd is in the proper format
module.exports = {
	checkData: function(data, orderObj, table_id, cb) {
		var order = HELPER.caseInsensitiveKey(data, 'order');

		if (! order) {
			return cb('Missing args');
		}

		if (! Array.isArray(order)) {
			return cb('Invalid format for order');
		}

		var orders = [];

		for (let i of order) {
			var temp = {};

			var type = HELPER.caseInsensitiveKey(i, 'type');
			var size = HELPER.caseInsensitiveKey(i, 'size');
			var quantity = HELPER.caseInsensitiveKey(i, 'quantity');

			//ensure type of drinks given and is valid or skip that part of the order
			if (type &&  _jsonVals(TYPES).indexOf(type.toUpperCase()) >= 0) {
				temp.type = type.toUpperCase();
			} else continue;

			//ensure sizes given and is valid or default to Medium
			if (size && _jsonVals(SIZES).indexOf(size.toUpperCase()) >= 0) {
				temp.size = size.toUpperCase();
			} else {
				temp.size = SIZES.M;
			}

			//ensure quantity given or default to 1
			if (quantity) {
				temp.quantity = quantity;
			} else {
				temp.quantity = 1;
			}

			//once verified, add to list of orders for given table
			orders.push(temp);
		}

		if (orders.length === 0) {
			return cb('No valid orders to fill');
		}

		//produce new order_id for valid order
		orderObj.getOrderNum(function(err, order_id) {
			if (err) {
				return cb(err);
			}

			//return order information
			cb(null, {
				table_id: table_id,
				order_id: order_id,
				orders: orders
			});
		});
	}
};

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

module.exports.Order = Order;
