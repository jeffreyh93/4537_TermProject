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
    if ((courseName = sessionStorage.getItem("courseName")) != null) {
        document.getElementById("courseName").value = courseName;
    }
    if ((courseDesc = sessionStorage.getItem("courseDesc")) != null) {
        document.getElementById("courseDesc").value = courseDesc;
    }
}

function addDay(day) {
    let timeDiv = document.getElementById("timePicker");

    if ((tmp = document.getElementById(day)) != null) {
        tmp.remove();
        return;
    }

    dayString = "";
    switch (day) {
        case 0: dayString = "Monday"; break;
        case 1: dayString = "Tuesday"; break;
        case 2: dayString = "Wednesday"; break;
        case 3: dayString = "Thursday"; break;
        case 4: dayString = "Friday"; break;
    }
    let dayDiv = document.createElement("div");
    dayDiv.id = day;
    timeDiv.appendChild(dayDiv);
    dayDiv.innerHTML = dayString + ": ";

    dayDiv.appendChild(document.createElement("br"));

    let startLabel = document.createElement("label");
    startLabel.innerHTML = "Start Time:";
    dayDiv.appendChild(startLabel);

    let startInput = document.createElement("input");
    startInput.setAttribute("type", "time");
    startInput.id = day + "start";
    dayDiv.appendChild(startInput);

    dayDiv.appendChild(document.createElement("br"));

    let endLabel = document.createElement("label");
    endLabel.innerHTML = "End Time:";
    dayDiv.appendChild(endLabel);

    let endInput = document.createElement("input");
    endInput.setAttribute("type", "time");
    endInput.id = day + "end";
    dayDiv.appendChild(endInput);
}

function updateCourse() {
    sendObj = {};
    sendObj.name = document.getElementById("courseDesc").value;
    sendObj.shortName = document.getElementById("courseName").value;
    sendObj.lectureTimes = [];
    for (let i = 0; i < 5; i++) {
        if ((dayDiv = document.getElementById(i)) != null) {
            let dayObj = {};
            let dateCh = "";
            switch (i) {
                case 0: dateCh = "M"; break;
                case 1: dateCh = "T"; break;
                case 2: dateCh = "W"; break;
                case 3: dateCh = "U"; break;
                case 4: dateCh = "F"; break;
            }
            dayObj.day = dateCh;
            dayObj.startTime = document.getElementById(i + "start").value;
            dayObj.endTime = document.getElementById(i + "end").value;
            sendObj.lectureTimes.push(dayObj);
        }
    }
    let urlParams = new URLSearchParams(window.location.search);
    let courseId = urlParams.get('courseId');

    let resource = "courses/" + courseId;
    xhttp.open("PUT", endPointRoot + resource, true);
    xhttp.setRequestHeader("admin-token", token);
    xhttp.send(JSON.stringify(sendObj));
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let res = JSON.parse(this.responseText);
            document.getElementById("msg").innerHTML = res.message;
        }
    }
}

function back() {
    sessionStorage.removeItem("courseName");
    sessionStorage.removeItem("courseDesc");
    location.href = './updateCourse.html';
}