// get the session token
const token = sessionStorage.getItem("adminToken");

const xhttp = new XMLHttpRequest();
const endPointRoot = "https://slok.me/4537/termproject/API/v1/";

if (token === null) {
    document.getElementById("msg").innerHTML = "Invalid page, redirecting to home page in 5s!";
    setTimeout(function() {
        location.href = 'admin.html';
    }, 5000);   
} else {
    // token is present and authorized, proceed with admin API calls
    contentDiv = document.getElementById("content");
    contentDiv.style.display = "block";

    let resource = "apiLogin";

    xhttp.open("POST", endPointRoot + resource, true);
    let sendObj = {};
    sendObj.user = "apiAdmin";
    sendObj.password = "giveMeStats";

    xhttp.send(JSON.stringify(sendObj));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            let apiTok = res.token;
            displayHits(apiTok);
        }
    }
}

function displayHits(apiTok) {
    let resource = "apistats";
    xhttp.open("GET", endPointRoot + resource, true);
    xhttp.setRequestHeader("admin-token", apiTok);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            let apiArr = res.data;
            let myTable = document.getElementById("tableBody");
            for (let i = 0; i < apiArr.length; i++) {
                if (apiArr[i].Method !== "OPTIONS") {
                let row = document.createElement("tr");
                myTable.appendChild(row);
        
                let hitData = document.createElement("td");
                row.appendChild(hitData);
                hitData.innerHTML = apiArr[i].Hits;
        
                let methodData = document.createElement("td");
                row.appendChild(methodData);
                methodData.innerHTML = apiArr[i].Method;
        
                let pathData = document.createElement("td");
                row.appendChild(pathData);
                pathData.innerHTML = apiArr[i].Pathname;
                }
            }
        }
    }
}

function logout() {
    sessionStorage.removeItem("adminToken");
}