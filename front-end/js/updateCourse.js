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

    let resource = "courses";
    xhttp.open("GET", endPointRoot + resource, true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let resObj = JSON.parse(this.responseText);
            displayList(resObj.data);
        }
    }
}
function displayList(dataArr) {
    let courseDiv = document.getElementById("courses");
    courseDiv.innerHTML = "";
    for (let i = 0; i < dataArr.length; i++) {
        let tempDiv = document.createElement("div");
        courseDiv.appendChild(tempDiv);

        tempDiv.className = "form-group courseDiv";

        tempDiv.addEventListener("click", function() {
            sessionStorage.setItem("courseName", dataArr[i].shortName);
            sessionStorage.setItem("courseDesc", dataArr[i].name);
            location.href = './courseForm.html?courseId='+dataArr[i].CourseId;
        });
        
        let labelName = document.createElement("label");
        tempDiv.appendChild(labelName);
        labelName.className = "control-label col-sm-4";
        labelName.innerHTML = "Course Description: ";

        let name = document.createElement("label");
        tempDiv.appendChild(name);
        name.className = "control-label col-sm-6";
        name.innerHTML = dataArr[i].name;

        let labelShort = document.createElement("label");
        tempDiv.appendChild(labelShort);
        labelShort.className = "control-label col-sm-4";
        labelShort.innerHTML = "Course Name: ";

        let short = document.createElement("label");
        tempDiv.appendChild(short);
        short.className = "control-label col-sm-6";
        short.innerHTML = dataArr[i].shortName; 
    }
}

function courseDetails(dataArr, index) {
    
}

function back() {
    location.href = '../adminHome.html';
}