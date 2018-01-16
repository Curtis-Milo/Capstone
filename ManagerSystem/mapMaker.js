var map;
var table_coords;
var table_refs;
var length;
var width;
var square_size = 200;
function parseFiles(){
	var prevFile = false;
	map = [];
	if(prevFile){
		var mapfile;
		parse = mapfile.split('\n').split(",")
		length= parse[0][0];
		width = parse[0][1];
		for (var i = 1; i < length+1; i++) {
			map.push([]);
			for (var j = 0; j < width; j++) {
			 map[i].push(parse[i][j]);
			}
		}
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
	var mapfile;
	mapText = length+","+width +"\n";
	for (var i = 0; i < length; i++) {
		map.push([]);
		for (var j = 0; j < width; j++) {
			if(j == width-1){
				mapText = mapText +map[i][j];
			}else{
				mapText = mapText +map[i][j] +",";
			}
			
		}
		if(i != length-1){
				mapText = mapText +"\n";
		}
	}

}

function onClickChange(i,j){
	console.log("merp i = "+i+", j = "+j)
	map[i][j] = (map[i][j]+1)%4;
	updateMap();
}

function updateMap(){
	var mapString = "";
	table_coords = [];
	table_refs = [];
	count_tblRef = 0;
	var top = 100;
	for (var i = 0; i < length; i++) {	
			var left = 0;
			for (var j = 0; j < width; j++) {
			 var button = "<div style =  \"position:fixed; left:"+left+"px; top:"+top+"px; \"";
			 var insideStuff= "";
			 if (map[i][j] == "0"){
			 	insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"clear\""; 
			 }else if(map[i][j] == "1"){
				insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"blocked\""; 	
			 }else if(map[i][j] == "2"){
				insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"table\"";
				//update table refereces
				table_refs.push(count_tblRef);
				table_coords.push([i,j]); 
				count_tblRef = count_tblRef+1;
			 }else if(map[i][j] == "3"){
				insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"base\"";
			 }

			 button = button+ insideStuff + "></div";
			 mapString = mapString + button;
			 left= left+square_size;
			}
			top= top+square_size;
		}
		document.getElementById("board").innerHTML =mapString;

}

function load() {
	
	parseFiles();
	updateMap();
}