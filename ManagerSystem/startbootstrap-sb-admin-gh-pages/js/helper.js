//errors page vars
var errList = [];
//map maker vars
var map;
var table_coords;
var table_refs;
var length;
var width;
var square_size = 100;
var editTables = false;
var mapFile;
var mapModified = false;

//testing vars
mapTEST =   "10,10\n3,0,0,0,0,0,0,0,0,0\n0,2,0,2,0,0,0,0,0,0\n0,0,0,1,0,0,0,0,0,0\n" +
        "0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n" + 
        "0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0";

//what to do when window loads
window.onload = function() {
    x = document.getElementById('lowLiquid');
    path = document.location.pathname;
    
    //dev mode
    if (document.location.hostname=='localhost' && document.location.port==3000) {
        if (path=='/' || path=='/errors.html') {
            if (document.location.hostname=='localhost' && document.location.port==3000) {
                //testing at home
                setErrorList(15);
            }
        } else if (path=='/charts.html') {
            parseFiles();
            updateMap();
        }
    //prod
    } else {
        if (path=='/' || path=='/errors.html') {
            NetworkCall('getErrors');
        } else if (path=='/charts.html') {
            parseFiles();
            updateMap();
        }
    }
    
};

function parseFiles(){
    if (typeof mapFile=='undefined') {
        var prevFile = false;
    } else {
        var prevFile = true;
    }
    map = [];
    if(prevFile){
        try {
        lines = mapFile.split('\n');
        temp = lines[0];
        length= temp.split(',')[0];
        width = temp.split(',')[1];
        for (var i = 1; i < length+1; i++) {
            map.push([]);
            for (var j = 0; j < width; j++) {
                temp = lines[i].split(',')
                map[i-1].push(temp[j]);
            }
        }
    } catch (err) {
        console.log(err.message);
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

    mapFile = length+","+width +"\n";
    for (var i = 0; i < length; i++) {
        map.push([]);
        for (var j = 0; j < width; j++) {
            if(j == width-1){
                mapFile = mapFile +map[i][j];
            }else{
                mapFile = mapFile +map[i][j] +",";
            }            
        }
        if(i != length-1){
                mapFile = mapFile +"\n";
        }
    }
    NetworkCall('save_map');

}

//map maker function every time a block is clicked
function onClickChange(i,j){
    console.log("merp i = "+i+", j = "+j)
    if (editTables) {
        //TODO edit table ids
    } else {
        // toggle map block
        mapModified = true;
        map[i][j] = (map[i][j]+1)%4;
        updateMap();        
    }
    
}

//map maker function to update the gui
function updateMap(){
    var mapString = "";
    table_coords = [];
    table_refs = [];
    count_tblRef = 0;
    var top = 100;

    for (var i = 0; i < length; i++) {  
            var left = 0;
            for (var j = 0; j < width; j++) {
                var label="";
                var button = "<div style =  \" display:block;float:left;    left:"+left+"px; top:"+top+"px;\"";
                var insideStuff= "";
                if (map[i][j] == "0"){
                    insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"clear\""; 
                }else if(map[i][j] == "1"){
                    insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"blocked\"";     
                }else if(map[i][j] == "2"){
                    insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"table\"";
                    label = "Table";
                    //update table refereces
                    table_refs.push(count_tblRef);
                    table_coords.push([i,j]); 
                    count_tblRef = count_tblRef+1;
                }else if(map[i][j] == "3"){
                    insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"base\"";
                    label = "Home";
                }
             
                button = button+ insideStuff + ">" + label +"</div>";
                mapString = mapString + button;
                left= left+square_size;
            }
            mapString=mapString+"<br>";
            top= top+square_size;
        }

    document.getElementById("board").innerHTML =mapString;
    console.log(document.getElementById("board"));
}

function load() {
    NetworkCall('load_map');
}



function setErrorList(errsList) {
    var errors = errsList;
    var StringErrors = "";
    errList = [];

    if ((errors && 0x00000001)==0x00000001){
        StringErrors = StringErrors + "LowLiquid <br>";
        errList.push('Low Liquid');
    }
    if((errors && 0x00000010)==0x00000010){
        StringErrors = StringErrors + "LeakingTank <br>";
        errList.push('Leaking Tank');
    }
    if ((errors && 0x00000100)==0x00000100){
        StringErrors = StringErrors + "LowBattery <br>";
        errList.push('Low Battery');
    }
    if ((errors && 0x00001000)==0x00001000){
        StringErrors = StringErrors + "NoMovement <br>";
        errList.push('No Movement');
    }
    renderErrors();
    //document.getElementById("errors").innerHTML = StringErrors;
  }

  function renderErrors() {
    var container = document.getElementById("errorContainer");
    $(container).html('');
    for (x in errList) {

        var str = errList[x];
        $(container).append('<div class="row text-center ml-5 w-25 "><div class="card card-body text-center text-white bg-danger o-hidden h-100 w-25">' +
                               // '<div class="card-body text-center">' +
                                str + '</div></div><br>');
        console.log(container);
    }
  }

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {
        // Otherwise, CORS is not supported by the browser.
        xhr = null;
    }
    return xhr;
}


function Login() {
    form = document.getElementById("loginForm");
    userid = form.user.value;
    passwd = form.pass.value;

    NetworkCall('login', [userid, passwd]);
    
}

function navigate(dest) {
   window.location.href = dest;
}

function NetworkCall(api_key, objects) {
    if (api_key=='login') {
        var xhttp = createCORSRequest('POST', "/proxy/login");
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        var temp = String(objects[0]) + ":" + String(objects[1]);
        var basic = btoa(temp);

        xhttp.setRequestHeader('Authorization', "Basic " + basic);

        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200) {
                navigate("../errors.html");
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }
        xhttp.send();


    } else if (api_key=='getErrors') {
        var xhttp = createCORSRequest('GET','/proxy/errors');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200) {
                setErrorList(xhttp.responseText);
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }
        xhttp.send();



    } else if (api_key=='save_map') {
        var xhttp = createCORSRequest('POST','/proxy/map');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200) {
                alert("uploaded to server");
                mapModified = false;
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }   
        xhttp.send(mapFile);


    } else if (api_key=='load_map') {
        var xhttp = createCORSRequest('GET','/proxy/map');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.send();
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200) {
                this.mapFile = String(xhttp.responseText);
                parseFiles();
                updateMap();
                mapModified = false;
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }   
    }
}
