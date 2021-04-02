
const xhttp = new XMLHttpRequest();
const endPointRoot = "https://slok.me/4537/termproject/API/v1/";

function getLogin() {
    let resource = "login";
    
    xhttp.open("POST", endPointRoot + resource, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        console.log("test");
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("msg").innerHTML = "status = " + this.status;
        }
    }
}

function createCourse() {
    let resource = "courses";
    
    xhttp.open("POST", endPointRoot + resource, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        console.log("test");
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("msg").innerHTML = "status = " + this.status;
            document.getElementById("msg").innerHTML += ", msg = " + this.responseText;
        }
    }
}

function getCourses() {
    let resource = "courses";
    
    xhttp.open("GET", endPointRoot + resource, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        console.log("test");
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("msg").innerHTML = "status = " + this.status;
            document.getElementById("msg").innerHTML += ", msg = " + this.responseText;
        }
    }
}