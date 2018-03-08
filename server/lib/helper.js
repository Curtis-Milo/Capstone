function _getSortOrder(prop) {
	return function(a, b) {
		if (a[prop] > b[prop]) {
			return -1;  
		} else if (a[prop] < b[prop]) {
			return 1;
		}
		return 0;
	}
}

module.exports = {
	sortOnAttr: function(list, attr) {
		var newList = list.slice();
		newList.sort(_getSortOrder(attr));
		return newList;
	},

	//binary search method to be used by queue
	//search and delete operations
	binSearch: function(list, element, attr) {
		var lower = 0;
		var upper = list.length - 1;

		element = element.toString();

		while (lower <= upper) {
			var mid = Math.floor((upper + lower) / 2);
			var curr = list[mid];

			if (curr[attr].toString() > element) {
				lower = mid + 1;
			} else if (curr[attr].toString() < element) {
				upper = mid - 1;
			} else {
				return mid;
			}
		} 

		return -1;
	},
	//case insensitive matching between two strings
	caseInsensitiveKey: function(obj, key) {
		for (let i of Object.keys(obj)) {
			if (i.toLowerCase() === key.toLowerCase()) {
				return obj[i];
			}
		}
		return null;
	},

	jsonVals: function(obj) {
		var ret = [];

		for (let key in obj) ret.push(obj[key]);

		return ret;
	},

	simplifyOrder: function(obj) {
		var orders = [];

		for (let i of obj) {
			var found = false;
			for (let j in orders) {
				if (i.type === orders[j].type && i.size === orders[j].size) {
					orders[j].quantity += i.quantity;
					found = true;
					break;
				}
			}

			if (! found) {
				orders.push(i);
			}
		}

		return orders;
	}
};
