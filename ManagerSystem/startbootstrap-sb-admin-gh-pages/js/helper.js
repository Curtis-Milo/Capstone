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
var mapSyms = ['0','X','T','H'];
//Drink management vars
var drinkArr;
var numTanks;

//testing vars
devMode = false;
mapTEST =   "10,10\n3,0,0,0,0,0,0,0,0,0\n0,2,0,2,0,0,0,0,0,0\n0,0,0,1,0,0,0,0,0,0\n" +
        "0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n" + 
        "0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0\n0,0,0,0,0,0,0,0,0,0";

//what to do when window loads
window.onload = function() {
    x = document.getElementById('lowLiquid');
    path = document.location.pathname;
    
    //dev mode
    if (document.location.hostname=='localhost' && document.location.port==3000) {
        devMode = true;
        if (path=='/' || path=='/errors.html') {
            if (document.location.hostname=='localhost' && document.location.port==3000) {
                //testing at home
                setErrorList(15);
            }
        } else if (path=='/charts.html') {
            parseFiles();
            updateMap();
        } else if (path=='/manageDrinks.html') {
            getAndSetDrinks();
        }
    //prod
    } else {
        devMode = false;
        if (path=='/' || path=='/errors.html') {
            NetworkCall('getErrors');
        } else if (path=='/charts.html') {
            parseFiles();
            updateMap();
        } else if (path=='/manageDrinks.html') {
            getAndSetDrinks();
        }
    }
    
};

function getAndSetDrinks() {
    if (!devMode) {
        NetworkCall('get-num-tanks');
        NetworkCall('get-drinks');        
    } else {
        drinksArr = {'coke':'1','pepsi':'3'};
        numTanks = 3;
        updateDrinksList();
    }

}

function tankFilled(num) {
    var listNames = Object.entries(drinksArr);
    for (x in listNames) {
        if (num==listNames[x][1]) {
            return true;
        }
    }
    console.log("num: " +num);
    return false;
}

function getIndex(num) {
    var listNames = Object.entries(drinksArr);
    for (x in listNames) {
        if (num==listNames[x][1]) {
            return x;
        }
    }
    return false;
}

function updateDrinksList() {
    var con = document.getElementById('drinkList');
    $(con).html('');
    var x=0;
    var listNames = Object.entries(drinksArr);
    for (var j=1; j<numTanks+1;j++) {

        if (tankFilled(j)) {
            x = getIndex(j);
            $(con).append('<div class="input-group mb-3 my-3 w-50">' + 
                    '<div class="input-group-prepend w-50">' + 
                    '<span class="input-group-text w-100"> Nozzle ' + j + ": " + 
                    '</span></div><input readonly class="form-control" type="text" value= ' + listNames[x][0] + ' >' +
                    '<div class="input-group-append">'+
                    '<div class="btn btn-danger onclick="removeDrink('+listNames[x][0]+');">Remove</div>' + '</div></div>');
        } else {
            $(con).append('<div class="input-group mb-3 my-3 w-50">' + 
                    '<div class="input-group-prepend w-50">' + 
                    '<span class="input-group-text w-100"> Nozzle ' + j + ": " + '</span>' +
                    '</div><input class="form-control" placeholder="NOT SET" id="nozzle' + j+'" type="text">' +
                    '<div class="input-group-append">'+
                    '<div class="btn btn-success" onclick="addDrink('+ j +');">Apply</div>' + '</div></div>');
        }
    }
}

function addDrink(nozzleNum) {
    elem = document.getElementById('nozzle'+ nozzleNum);
    var obj = {};
    obj[elem.value] = nozzleNum;
    NetworkCall('add_drink', obj );
}

function removeDrink(drinkName) {
    NetworkCall('remove_drink',drinkName);
}

/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------*/

function parseFiles(){
    if (typeof mapFile=='undefined') {
        var prevFile = false;
        console.log("mapFile is undefined");
    } else {
        var prevFile = true;
        console.log("mapFile is DEFINED");
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
                temp = lines[i].split(',');
                for (var j = 0; j < width; j++) {
                    map[i-1].push(temp[j]);
                }
            }
            table_coords = []
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
        map[0][0] = 'H';
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
    if (!devMode) {
        NetworkCall('save_map');
    } else {
        console.log(mapFile);
    }

}

//map maker function every time a block is clicked
function onClickChange(i,j){
    console.log("merp i = "+i+", j = "+j)
    if (editTables) {
        //TODO edit table ids
    } else {
        // toggle map block
        mapModified = true;
        console.log(map);
        map[i][j] = mapSyms[(mapSyms.indexOf(map[i][j])+1)%4];
        console.log(map);
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
                }else if(map[i][j] == "X"){
                    insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"blocked\"";     
                }else if(map[i][j] == "T"){
                    insideStuff = " onclick = \"onClickChange("+i+","+j+")\" id = \"table\"";
                    label = "Table";
                    //update table refereces
                    table_refs.push(count_tblRef);
                    table_coords.push([i,j]); 
                    count_tblRef = count_tblRef+1;
                }else if(map[i][j] == "H"){
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
}

function load() {
    NetworkCall('load_map');
}

/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------*/


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

/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------*/

function Login() {
    if (!devMode) {
        form = document.getElementById("loginForm");
        userid = form.user.value;
        passwd = form.pass.value;

        NetworkCall('login', [userid, passwd]);  
    } else {
        navigate('../errors.html');
    }
}


function Logout() {
    NetworkCall('logout');  
}

function navigate(dest) {
   window.location.href = dest;
}

/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------
/*------------------------------------------------------------------------------------------------------------------------------------------*/

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
    
    } else if (api_key=='logout') {
        var xhttp = createCORSRequest('POST','/proxy/logout');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if (xhttp.status==200) {
                navigate('../login.html');
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
            } else if (xhttp.status==401) {
                navigate('../index.html');
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
            } else if (xhttp.status==401) {
                navigate('../index.html');
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
                mapFile = String(xhttp.responseText);
                console.log(xhttp.responseText);
                console.log(mapFile);
                parseFiles();
                updateMap();
                mapModified = false;
            } else if (xhttp.status==401) {
                navigate('../index.html');
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }   
    } else if (api_key=='get_drinks') {
        var xhttp = createCORSRequest('GET','proxy/drinks');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if(xhttp.status==200) {
                drinksArr = xhttp.responseText;
                updateDrinksList();
            } else if (xhttp.status==401) {
                navigate('../index.html');
            } else {
                alert("error getting drink list");
            }
        }
        xhttp.send();
    } else if (api_key=='get_num_tanks') {
        var xhttp = createCORSRequest('GET','proxy/numOfTanks');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if(xhttp.status==200) {
                numTanks = xhttp.responseText;
            } else if (xhttp.status==401) {
                navigate('../index.html');
            } else {
                alert("error getting number of tanks");
            }
        }
        xhttp.send();

    } else if (api_key=='add_drink') {
        var xhttp = createCORSRequest('POST','proxy/drinks');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if(xhttp.status==200) {
                alert("added drink");
                NetworkCall('get_drinks');
            } else if (xhttp.status==401) {
                navigate('../index.html');
            } else {
                alert("error getting number of tanks");
            }
        }
        xhttp.send(JSON.stringify(object));

    } else if (api_key=='remove_drink') {
        var xhttp = createCORSRequest('DELETE','proxy/drinks?name='+String(object));
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        xhttp.onreadystatechange = function() {
            if(xhttp.status==200) {
                alert("removed drink");
                NetworkCall('get_drinks');
            } else if (xhttp.status==401) {
                navigate('../index.html');
            } else {
                alert("error getting number of tanks");
            }
        }
        xhttp.send();
    }
}
