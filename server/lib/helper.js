module.exports = {
	binSearch: function(list, element) {
		var lower = 0;
		var upper = list.length - 1;

		element = parseInt(element);

		while (lower <= upper) {
			var mid = Math.floor((upper + lower) / 2);
			var curr = list[mid];

			if (parseInt(curr.order_id) > element) {
				lower = mid + 1;
			} else if (parseInt(curr.order_id) < element) {
				upper = mid - 1;
			} else {
				return mid;
			}
		} 

		return -1;
	},
	caseInsensitiveKey: function(obj, key) {
		for (let i of Object.keys(obj)) {
			if (i.toLowerCase() === key.toLowerCase()) {
				return obj[i];
			}
		}
		return null;
	}
};
