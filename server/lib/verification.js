const HELPER = require('./helper');

function _cleanRequire(module){
    delete require.cache[require.resolve(module)]
    return require(module)
}

//verification that orders sent to server contain necessary
//information amd is in the proper format
module.exports = {
	checkData: function(data, orderObj, table_id, cb) {
		var SIZES = _cleanRequire('./sizes');
		var TYPES = _cleanRequire('./types');

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
			if (type &&  Object.keys(TYPES).indexOf(type.toUpperCase()) >= 0) {
				temp.type = type.toUpperCase();
				temp.tank_num = TYPES[type.toUpperCase()];
			} else continue;

			//ensure sizes given and is valid or default to Medium
			if (size && HELPER.jsonVals(SIZES).indexOf(size.toUpperCase()) >= 0) {
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

		orders = HELPER.simplifyOrder(orders);

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
				order: orders
			});
		});
	}
};
