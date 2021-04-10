// get the session token
const token = sessionStorage.getItem("adminToken");
const xhttp = new XMLHttpRequest();
const endPointRoot = "https://slok.me/4537/termproject/API/v1/";

if (token === null) {
    document.getElementById("msg").innerHTML = "Invalid page, redirecting to home page in 5s!";
    setTimeout(function() {
        location.href = '../admin.html';
    }, 5000);   
} else {
    // token is present and authorized, proceed with admin API calls
    contentDiv = document.getElementById("content");
    contentDiv.style.display = "block";

    let urlParams = new URLSearchParams(window.location.search);
    let courseId = urlParams.get('courseId');

    let resource = "courses/" + courseId + "/students";
    xhttp.open("GET", endPointRoot + resource, true);
    xhttp.setRequestHeader("admin-token", token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let resObj = JSON.parse(this.responseText);
            displayList(courseId, resObj.data[0]);
        }
    }
}

function displayList(courseId, dataArr) {
    let studentDiv = document.getElementById("students");
    studentDiv.innerHTML = "";
    console.log(dataArr);
    for (let i = 0; i < dataArr.length; i++) {
        let tempDiv = document.createElement("div");
        studentDiv.appendChild(tempDiv);

        tempDiv.className = "form-group studentDiv";
        tempDiv.addEventListener("click", function() {
            remove(courseId, dataArr[i].StudentId);
        });

        let labelId = document.createElement("label");
        tempDiv.appendChild(labelId);
        labelId.className = "control-label col-sm-4";
        labelId.innerHTML = "Student ID: ";

        let id = document.createElement("label");
        tempDiv.appendChild(id);
        id.className = "control-label col-sm-6";
        id.innerHTML = dataArr[i].StudentId;

        let labelUser = document.createElement("label");
        tempDiv.appendChild(labelUser);
        labelUser.className = "control-label col-sm-4";
        labelUser.innerHTML = "UserName: ";

        let user = document.createElement("label");
        tempDiv.appendChild(user);
        user.className = "control-label col-sm-6";
        user.innerHTML = dataArr[i].Username; 

        let labelName = document.createElement("label");
        tempDiv.appendChild(labelName);
        labelName.className = "control-label col-sm-4";
        labelName.innerHTML = "Student Name: ";

        let name = document.createElement("label");
        tempDiv.appendChild(name);
        name.className = "control-label col-sm-6";
        name.innerHTML = dataArr[i].name; 
    }
}

// TO-DO: make remove student API call here
function remove(courseId, studentId) {
    let resource = "courses/" + courseId + "/students/" + studentId;
    xhttp.open("DELETE", endPointRoot + resource, true);
    xhttp.setRequestHeader("admin-token", token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let msg = document.getElementById("msg");
            let res = JSON.parse(this.responseText);
            msg.innerHTML = res.message;

            let resource = "courses/" + courseId + "/students";
            xhttp.open("GET", endPointRoot + resource, true);
            xhttp.setRequestHeader("admin-token", token);
            xhttp.send();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let resObj = JSON.parse(this.responseText);
                    displayList(courseId, resObj.data[0]);
                }
            }
        }
    }
}

function back() {
    location.href = './dropStudent.html';
}