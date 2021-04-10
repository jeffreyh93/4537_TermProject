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
            courseDetails(dataArr, i);
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
    let popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
    let resource = "courses/" + dataArr[index].CourseId;
    xhttp.open("GET", endPointRoot + resource, true);
    //xhttp.setRequestHeader("student-token", token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //console.log(this.responseText);
            let popSpan = document.getElementById("myPopup");
            popSpan.innerHTML = "";

            let title = document.createElement("h2");
            title.innerHTML = "Course Details";
            popSpan.appendChild(title);
            popSpan.appendChild(document.createElement("br"));
            
            let resObj = JSON.parse(this.responseText).data;

            let labelName = document.createElement("label");
            popSpan.appendChild(labelName);
            labelName.className = "control-label col-md-6";
            labelName.innerHTML = "Course Description: ";

            let name = document.createElement("label");
            popSpan.appendChild(name);
            name.className = "control-label col-md-6";
            name.innerHTML = resObj.Name;

            let labelShort = document.createElement("label");
            popSpan.appendChild(labelShort);
            labelShort.className = "control-label col-md-6";
            labelShort.innerHTML = "Course Name: ";

            let short = document.createElement("label");
            popSpan.appendChild(short);
            short.className = "control-label col-md-6";
            short.innerHTML = resObj.shortName; 

            let lectureLabel = document.createElement("label");
            popSpan.appendChild(lectureLabel);
            lectureLabel.className = "control-label col-md-12";
            lectureLabel.innerHTML = "Lecture Time Slots"; 
            
            let dayArr = resObj.lectureTimes;
            for (let i = 0; i < dayArr.length; i++) {
                let dayDiv = document.createElement("div");
                popSpan.appendChild(dayDiv);

                let day = document.createElement("label");
                dayDiv.appendChild(day);
                day.className = "control-label col-md-6";
                let dayOfWeek = "";
                switch (dayArr[i].day) {
                    case 'M': dayOfWeek = "Mon"; break;
                    case 'T': dayOfWeek = "Tue"; break;
                    case 'W': dayOfWeek = "Wed"; break;
                    case 'U': dayOfWeek = "Thu"; break;
                    case 'F': dayOfWeek = "Fri"; break;
                }
                day.innerHTML = dayOfWeek + ":";

                let time = document.createElement("label");
                dayDiv.appendChild(time);
                time.className = "control-label col-md-6";
                time.innerHTML = dayArr[i].startTime + " - " + dayArr[i].endTime;
            }

            popSpan.appendChild(document.createElement("br"));

            let delBtn = document.createElement("button");
            delBtn.innerHTML = "Delete";
            delBtn.setAttribute("type", "button");
            popSpan.appendChild(delBtn);
            delBtn.addEventListener("click", function() {
                delCourse(dataArr, index);
            });

            let closeBtn = document.createElement("button");
            closeBtn.innerHTML = "Close";
            closeBtn.setAttribute("type", "button");
            closeBtn.addEventListener("click", function() {
                popup.classList.toggle("show");
            });
            popSpan.appendChild(closeBtn);
        }
    }
}

function delCourse(dataArr, index) {
    let courseId = dataArr[index].CourseId;
    let resource = "courses/" + courseId;

    xhttp.open("DELETE", endPointRoot + resource, true);
    xhttp.setRequestHeader("admin-token", token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let msg = document.getElementById("msg");
            let res = JSON.parse(this.responseText);
            msg.innerHTML = res.message;
            
            let popup = document.getElementById("myPopup");
            popup.classList.toggle("show");

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
    }
}

function back() {
    location.href = '../adminHome.html';
}