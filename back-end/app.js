const express = require("express");
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config.js');
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
    req.on('data', function(data) {
            data = data.toString('utf8');
            let jsonObj = JSON.parse(data);
            var sql;
            if (jsonObj.admin) {
                sql = "CALL sp_adminLogin('" + jsonObj.user + "','"+ jsonObj.password + "');" 
            } else {
                sql = "CALL sp_studentLogin('" + jsonObj.user + "','"+ jsonObj.password + "');" 
            }
            connection.query(sql, function (err, result) {
                if (err) {
                    throw err;
                }
                // Reassign result to the RowDataPacket coming in from query
                result = result[0][0];
                if(result.valid == 1){
                    let token = jwt.sign({
                        id: result.id,
                        admin: jsonObj.admin
                    }, 
                    config.secret,
                    {
                        expiresIn: 86400
                    });
                    res.status(200).send({auth: true, token: token});
                } else {
                    res.status(401).send({auth: false});
                }
            });    
    });
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