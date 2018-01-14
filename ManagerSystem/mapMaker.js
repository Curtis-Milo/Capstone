var map;
var table_coords;
var table_refs;
var length;
var width;
function parseFiles(){
	var file = false;
	if(file){
		//parse from text file
	}else{
		//default information when there is no 
		length = 10;
		width = 10;
		//Setting all the information to 0 except for the last one
		for (var i = 0; i < length; i++) {
			map.push([]);
			for (var j = 0; j < width; j++) {
			 map[i].push("0");
			}
		}
		map[0][0] = 3;
		table_coords = [];
	}
}

function updateMap(){
	var mapString = "";

	for (var i = 0; i < length; i++) {	
			for (var j = 0; j < width; j++) {
			 var button = "";
			 if (map[i][j] == "0"){

			 }else if(map[i][j] == "1"){

			 }else if(map[i][j] == "2"){

			 }else if(map[i][j] == "3"){

			 }

			 button = button+ "";
			 mapString = mapString + button;
			}
		}


}

function load() {
	updateMap();
}