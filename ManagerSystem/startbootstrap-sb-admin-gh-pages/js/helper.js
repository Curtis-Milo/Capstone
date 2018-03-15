var errList = [];

window.onload = function() {
    x = document.getElementById('lowLiquid');
    console.log(x);
    console.log("hello");
    NetworkCall('getErrors');
};

function setErrorList(errsList) {
    var errors = 0x00001111;
    var StringErrors = "";
    console.log(errsList);

    if ((errors && 0x00000001)==0x00000001){
        StringErrors = StringErrors + "LowLiquid <br>";
        errList.push('lowLiquid');
    }
    if((errors && 0x00000010)==0x00000010){
        StringErrors = StringErrors + "LeakingTank <br>";
        errList.push('leakingTank');
    }
    if ((errors && 0x00000100)==0x00000100){
        StringErrors = StringErrors + "LowBattery <br>";
        errList.push('lowBattery');
    }
    if ((errors && 0x00001000)==0x00001000){
        StringErrors = StringErrors + "NoMovement <br>";
        errList.push('noMovement');
    }
    renderErrors();
    //document.getElementById("errors").innerHTML = StringErrors;
  }

  function renderErrors() {

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
    var xhttp = new XMLHttpRequest();
    if (api_key=='login') {
        var xhttp = createCORSRequest('POST', "/proxy/login");
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        var temp = String(objects[0]) + ":" + String(objects[1]);
        var basic = btoa(temp);
        // xhttp.open("POST", "http://130.113.68.87:8080/login");
        xhttp.setRequestHeader('Authorization', "Basic " + basic);
        // xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        // xhttp.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");

        var tempResp;
        xhttp.onload = function() {
            tempResp = xhttp.responseText;
        }
        xhttp.onerror = function() {
            console.log("error");
        }
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200) {
                navigate("../index.html");
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }
    } else if (api_key=='getErrors') {
        var xhttp = createCORSRequest('GET','/proxy/errors');
        if (!xhttp) {
            throw new Error('CORS not supported');
        }
        var tempResp;
        xhttp.onload = function() {
            tempResp = xhttp.responseText;
        }
        xhttp.onerror = function() {
            console.log("error");
        }
        xhttp.onreadystatechange = function() {
            if (xhttp.status == 200) {
                setErrorList(xhttp.responseText);
            } else {
                console.log("Error: " + xhttp.responseText);
            }
        }
    }
    
    xhttp.send();
}
