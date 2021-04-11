
const xhttp = new XMLHttpRequest();
const endPointRoot = "https://slok.me/4537/termproject/API/v1/";

function getLogin() {
    let resource = "login";
    
    let user = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    let sendObj = {};
    sendObj.user = user;
    sendObj.password = pass;
    sendObj.admin = false;

    console.log(sendObj);

    xhttp.open("POST", endPointRoot + resource, true);
    xhttp.send(JSON.stringify(sendObj));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("msg").innerHTML = "";
            //document.getElementById("msg").innerHTML = "status = " + this.responseText;
            resObj = JSON.parse(this.responseText);
            sessionStorage.setItem("studentToken", resObj.token);
            location.href = 'studentHome.html';
        } else {
            document.getElementById("msg").innerHTML = "Invalid username/password";
        }
    }
}