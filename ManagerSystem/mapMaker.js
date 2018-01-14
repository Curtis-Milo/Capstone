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

function save(){


}

function onClickChange(i,j){
	map[i][j] = (map[i][j]+1)%4;
	updateMap();
}

function updateMap(){
	var mapString = "";
	table_coords = [];
	table_refs = [];
	count_tblRef = 0;
	for (var i = 0; i < length; i++) {	
			for (var j = 0; j < width; j++) {
			 var button = "<p";
			 var insideStuff= "";
			 if (map[i][j] == "0"){
			 	insideStuff = "onclick = \"onClickChange("+i+","+j+")\" id = \"clear\""; 
			 }else if(map[i][j] == "1"){
				insideStuff = "onclick = \"onClickChange("+i+","+j+")\" id = \"blocked\""; 	
			 }else if(map[i][j] == "2"){
				insideStuff = "onclick = \"onClickChange("+i+","+j+")\" id = \"table\"";
				//update table refereces
				table_refs.push(count_tblRef);
				table_coords.push([i,j]); 
				count_tblRef = count_tblRef+1;
			 }else if(map[i][j] == "3"){
				insideStuff = "onclick = \"onClickChange("+i+","+j+")\" id = \"base\"";
			 }

			 button = insideStuff + "/>";
			 mapString = mapString + button;
			}
		}
		document.getElementById("demo").innerHTML =mapString;

}

function load() {
	
	parseFiles();
	updateMap();
}