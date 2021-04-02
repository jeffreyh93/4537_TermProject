const express = require("express");
const mysql = require("mysql");
const PORT = process.env.PORT || 8888;
const app = express();
const endPointRoot = "/4537/termproject/API/v1";

const connection = mysql.createConnection({
    host: "localhost",
    user: "slokme_d3l_master",
    password: "Desire3Learn",
    database: "slokme_d3l"
});

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.post(endPointRoot + "/login", (req, res) => {
    res.send("login successful");
});

app.route(endPointRoot + '/courses')
    .get(function (req, res) {
        res.send("getting list of courses")
    })

    .post(function (req, res) {
        res.send("creating course");
    })



app.get(endPointRoot + "/courses/students/:courseId", (req, res) => {
    res.send(req.params.courseId);
});

app.listen(PORT, (err) => {
    console.log("listening to port", PORT);
});