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

    str = NetworkCall('login', [userid, passwd]);
    console.log(str);
}

function NetworkCall(api_key, objects) {
    var xhttp = new XMLHttpRequest();
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
        console.log("fuck");
    }
    xhttp.onerror = function() {
        console.log("error");
    }
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            return true;
        } else {
            console.log("Error: " + xhttp.responseText);
        }
    }
    
    xhttp.send();
}
