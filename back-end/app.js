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
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, adminToken');
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

app.route(endPointRoot + '/courses/:courseId')
    .get(function (req, res){
        let sql = "CALL sp_getOneCourseDetails("+ req.params.courseId +");";
        connection.query(sql, function (err, result) {
            if (err) {
                res.status(400).send({status: "FAIL", message: "Unknown error, could not grab course data. This course may not exist in database"});
            }
            res.status(200).send({status: "OK", data: result[0][0]});
        });
    })
    .delete(function(req, res){
        let token = req.headers['admin-token'];
        if (!token) {
            return res.status(401).send({auth: false, message: "No token was provided, a token is needed to perform this request"});
        }
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(500).send({auth: false, message: "Failed toauthenticate this token!"});
            }
            if (!decoded.admin) {
                return res.status(401).send({auth: false, message: "User is not authorized to perform this request: Not an admin!"});
            }
        });
        let sql = "CALL sp_deleteCourse(" + req.params.courseId + ");";
        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.status(200).send({status: "OK", message: "course successfully deleted"});
        });
    })


app.route(endPointRoot + '/courses')
    .get(function (req, res) {
        let sql = "CALL sp_getAllCourses();";
        connection.query(sql, function (err, result) {
            if (err) {
                res.status(400).send({status: "FAIL", message: "Unknown error, could not grab course data"});
            }
            res.status(200).send({status: "OK", data: result[0]});
        });
    })

    .post(function (req, res) {
        let token = req.headers['admin-token'];
        if(!token) {
            return res.status(401).send({auth: false, message: "No token was provided, a token is needed to perform this request"});
        }
        req.on('data', function(data) {
            data = data.toString('utf8');
            let jsonObj = JSON.parse(data);

            // verify admin token
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) {
                    return res.status(500).send({auth: false, message: "Failed to authenticate this token!"});
                }
                if (!decoded.admin) {
                    return res.status(401).send({auth: false, message: "User is not authorized to perform this request: Not an admin!"});
                }
                console.log("data: " + data);
                let sql = "CALL sp_createCourse(" + decoded.id + ", '" + jsonObj.name +"');";
                connection.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    // Reassign result to the RowDataPacket coming in from query
                    result = result[0][0];

                    // iterate over lecture times and add each lecture times to DB individually
                    jsonObj.lectureTimes.forEach((x) => {
                        sql = "CALL sp_createCourseTimeslot(" + result.courseid + ", '" + x.day + "', " + x.startTime + "," + x.endTime + ");";
                        connection.query(sql, function(err, result) {
                            if (err) {
                                throw err;
                            }
                            res.status(200).send({status: "OK", message: "Sucessfully created course"});
                        });
                    });
                });    
            });
            
        });
    })



app.get(endPointRoot + "/courses/students/:courseId", (req, res) => {
    res.send(req.params.courseId);
});

app.listen(PORT, (err) => {
    console.log("listening to port", PORT);
});