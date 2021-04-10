const express = require("express");
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('./config.js');
const url = require('url');
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
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, admin-token, student-token');
    let urlData = url.parse(req.url);
    connection.query(`CALL sp_createApiUsage('${req.method}','${urlData.pathname}')`, function (err, result) {
        if (err) {
            throw err;
        }
    });
    next();
});

app.post(endPointRoot + "/login", (req, res) => {
    req.on('data', function(data) {
            data = data.toString('utf8');
            let jsonObj = JSON.parse(data);
            console.log(jsonObj);
            var sql;
            if (jsonObj.admin) {
                sql = `CALL sp_adminLogin('${jsonObj.user}','${jsonObj.password}');` 
                console.log(sql);
            } else {
                sql = `CALL sp_studentLogin('${jsonObj.user}','${jsonObj.password}');` 
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
        connection.promise = (sql) => {
            return new Promise ((resolve, reject) => {
                connection.query(sql, (err, result) => {
                    if (err) {
                        reject(new Error());
                    } else {
                        resolve(result[0][0]);
                    }
                });
            });
        }
        let sql = `CALL sp_getOneCourseDetails(${req.params.courseId});`;
        connection.promise(sql)
        .then((obj) => {
            let sql = `CALL sp_getCourseTimeslot(${obj.CourseId})`;
            connection.query(sql, function (err, result){
                if (err) {
                    throw err;
                }
                obj.lectureTimes = [];
                result = result[0];
                result.forEach((lectureTime) => {
                    let lectureObj = {day: lectureTime.Day, startTime: lectureTime.StartTime, endTime: lectureTime.EndTime};
                    obj.lectureTimes.push(lectureObj);
                });
                res.status(200).send({status: "OK", data: obj});
            });
        })
        .catch((err) => {
            res.status(400).send({status: "FAIL", message: "Error: " + err});
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
    
    .put(function(req,res) {
        let token = req.headers['admin-token'];
        if(!token) {
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
        
        req.on('data', function(data) {
            data = data.toString('utf8');
            let jsonObj = JSON.parse(data);
            let sql = `CALL sp_updateCourse(${req.params.courseId}, '${jsonObj.name}', '${jsonObj.shortName}');`;
            connection.query(sql, function(err, result) {
                if (err) {
                    res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
                }
            });
            sql = `CALL sp_deleteCourseTimeslots(${req.params.courseId});`;
            connection.promise = (sql) => {
                return new Promise ((resolve, reject) => {
                    connection.query(sql, (err, result) => {
                        if (err) {
                            reject(new Error());
                        } else {
                            resolve();
                        }
                    });
                });
            }
            connection.promise(sql)
            .then(() => {
                // iterate over lecture times and add each lecture times to DB individually
                jsonObj.lectureTimes.forEach((x) => {
                    sql = `CALL sp_createCourseTimeslot(${req.params.courseId}, '${x.day}', '${x.startTime}', '${x.endTime}');`;
                    connection.query(sql, function(err, result) {
                        if (err) {
                            res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
                        }
                    })
                });
                res.status(200).send({auth: true, status: "OK", message: "Sucessfully updated course"});
            });
        });


    });


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
                    return res.status(500).send({auth: false, status: "FAIL", message: "Failed to authenticate this token!"});
                }
                if (!decoded.admin) {
                    return res.status(401).send({auth: false, status: "FAIL", message: "User is not authorized to perform this request: Not an admin!"});
                }
                let sql = `CALL sp_createCourse(${decoded.id}, '${jsonObj.name} ', '${jsonObj.shortName}');`;
                connection.query(sql, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    // Reassign result to the RowDataPacket coming in from query
                    result = result[0][0];

                    // iterate over lecture times and add each lecture times to DB individually
                    jsonObj.lectureTimes.forEach((x) => {
                        sql = `CALL sp_createCourseTimeslot(${result.courseid}, '${x.day}', '${x.startTime}', '${x.endTime}');`;
                        connection.query(sql, function(err, result) {
                            if (err) {
                                res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
                            }
                        })
                    });
                    res.status(200).send({auth: true, status: "OK", message: "Sucessfully created course"});
                });    
            });
        });
    })

app.post(endPointRoot + "/courses/students", (req, res) => {
    let token = req.headers['student-token'];
    console.log('beginning of post request');
    if(!token) {
        return res.status(401).send({auth: false, status: "FAIL", message: "No token was provided, a token is needed to perform this request"});
    }
    req.on('data', function(data) {
        data = data.toString('utf8');
        let jsonObj = JSON.parse(data);
        jwt.verify(token, config.secret, function(err, decoded) {
            console.log('verify token');
            if (err) {
                console.log(err);
                return res.status(500).send({auth: false, status: "FAIL", message: "Failed to authenticate token: " + err});
            }
            let sql = `CALL sp_registerStudentToCourse(${decoded.id}, ${jsonObj.courseId})`
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
                }
                return res.status(200).send({auth: true, status: "OK", message: "successfully registered student to course!"});
            });
        });
    });
});

app.route(endPointRoot + "/courses/:courseId/students/")
    .get(function (req, res) {
        let token = req.headers['admin-token'];
        if(!token) {
            return res.status(401).send({auth: false, status: "FAIL", message: "No token was provided, a token is needed to perform this request"});
        }
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(500).send({auth: false, status: "FAIL", message: "Failed to authenticate token: " + err});
            }
        }); 
        let sql = `CALL sp_getListOfActiveStudentsInCourse(${req.params.courseId});`;
        connection.query(sql, function(err, result) {
            if (err) {
                return res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
            }
            return res.status(200).send({auth: true, status: "OK", data: result
            });
        })
    });

app.put(endPointRoot + "/students",  (req,res) => {
    let token = req.headers['student-token'];
    if(!token) {
        return res.status(401).send({auth: false, status: "FAIL", message: "No token was provided, a token is needed to perform this request"});
    }
    req.on('data', function(data) {
        data = data.toString('utf8'); 
        let jsonObj = JSON.parse(data);
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(500).send({auth: false, status: "FAIL", message: "Failed to authenticate token: " + err});
            }
            let sql = `CALL sp_updateStudent(${decoded.id}, '${jsonObj.user}', '${jsonObj.password}', '${jsonObj.name}');`;
            connection.query(sql, function(err, result) {
                if (err) {
                    return res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
                }
                return res.status(200).send({auth: true, status: "OK", message: "student record updated!"
                });
            })
        }); 
    });
});
    
app.delete(endPointRoot + "/courses/:courseId/students/:studentId",(req, res) => {
    let token = req.headers['admin-token'];
    if(!token) {
        return res.status(401).send({auth: false, status: "FAIL", message: "No token was provided, a token is needed to perform this request"});
    }
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            return res.status(500).send({auth: false, status: "FAIL", message: "Failed to authenticate token: " + err});
        }
        if(!decoded.admin) {
            return res.status(401).send({auth: false, status: "FAIL", message: "not authorized to perform this request. Admin privileges required"});
        }
        let sql = `CALL sp_removeStudentFromCourse(${req.params.courseId}, ${req.params.studentId});`;
        connection.query(sql, function(err, result) {
            if (err) {
                return res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
            }
            return res.status(200).send({auth: true, status: "OK", message: "student successfully removed"
            });
        })
    }); 
});

app.get(endPointRoot + "/apistats", (req, res) => {
    let sql = `CALL sp_getApiStats();`;
    let token = req.headers['admin-token'];
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            return res.status(500).send({auth: false, message: "Failed toauthenticate this token!"});
        }
    });

    connection.query(sql, function(err, result) {
        if (err) {
            return res.status(500).send({auth: true, status: "FAIL", message: "DB err: " + err});
        }
        return res.status(200).send({auth: true, status: "OK", data: result[0]});
    })
})

app.post(endPointRoot + "/apiLogin", (req,res) => {
    req.on('data', function(data) {
        data = data.toString('utf8'); 
        let jsonObj = JSON.parse(data);
        let sql = `CALL sp_apiAdminLogin('${jsonObj.user}');`;
        connection.query(sql, function(err, result) {
            result = result[0][0];
            if (err) {
                return res.status(500).send({auth: true, status: "FAIL", message: "DB err: "  + err});
            }
            let validPassword = bcrypt.compareSync(jsonObj.password, result.Password);
            if (!validPassword) {
                return res.status(401).status({auth: false, token: null, message: "invalid credentials"});
            }
            
            let token = jwt.sign({id: result.apiAdminId}, config.secret, { expiresIn: 86400
            });
            res.status(200).send({auth: true, token: token, message: "authentication successful"});
        })
    });
})

app.post(endPointRoot + "/apiRegister", (req,res) => {
    req.on('data', function(data) {
        data = data.toString('utf8'); 
        let jsonObj = JSON.parse(data);
        let hashedPass = bcrypt.hashSync(jsonObj.password, 12);
        let sql = `CALL sp_registerApiAdmin('${jsonObj.user}', '${hashedPass}');`;
        connection.query(sql, function(err, result) {
            if (err) {
                return res.status(500).send({status: "FAIL", message: "DB err: "  + err});
            }
            return res.status(200).send({status: "OK", message: "registration successful"});
        });
        
    })
})

app.listen(PORT, (err) => {
    console.log("listening to port", PORT);
});