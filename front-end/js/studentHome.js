// get the session token
const token = sessionStorage.getItem("studentToken");

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

function logout() {
    sessionStorage.removeItem("studentToken");
}