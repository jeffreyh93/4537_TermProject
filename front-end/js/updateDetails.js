// get the session token
const token = sessionStorage.getItem("studentToken");
const xhttp = new XMLHttpRequest();
const endPointRoot = "https://slok.me/4537/termproject/API/v1/";

if (token === null) {
    document.getElementById("msg").innerHTML = "Invalid page, redirecting to home page in 5s!";
    setTimeout(function() {
        location.href = 'student.html';
    }, 5000);   
} else {
    // token is present and authorized, proceed with admin API calls
    contentDiv = document.getElementById("content");
    contentDiv.style.display = "block";
}

function updateDetails() {
    let resource = "students";
    let sendObj = {};
    sendObj.user = document.getElementById("username").value;
    sendObj.name = document.getElementById("name").value;
    sendObj.password = document.getElementById("password").value;

    xhttp.open("PUT", endPointRoot + resource, true);
    xhttp.setRequestHeader("student-token", token);
    xhttp.send(JSON.stringify(sendObj));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            document.getElementById("msg").innerHTML = res.message;
            document.getElementById("username").value = "";
            document.getElementById("name").value = "";
            document.getElementById("password").value = "";
        }    
    }
}

function back() {
    location.href = '../studentHome.html';
}