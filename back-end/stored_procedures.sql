DELIMITER $$
CREATE PROCEDURE `sp_createCourse`(IN `AdmnId` INT, IN `crsName` VARCHAR(100), IN `crsShrtName` VARCHAR(20))
BEGIN
INSERT INTO Course (AdminId, Name, shortName) VALUES (AdmnId, crsName, crsShrtName);
SELECT LAST_INSERT_ID() AS 'courseid';
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_apiAdminLogin`(IN `user` VARCHAR(100))
BEGIN
SELECT *
FROM `apiAdmin`
WHERE Username = user
LIMIT 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_adminLogin`(IN `Usernm` VARCHAR(100), IN `Pass` VARCHAR(100))
BEGIN
	SELECT COUNT(*) AS 'valid', AdminId AS 'id'
    FROM slokme_d3l.Admin a 
    WHERE (a.Username = Usernm) 
    AND (a.Password = Pass);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_createCourseTimeslot`(IN `crsId` INT, IN `crsDay` CHAR(1), IN `strtTime` VARCHAR(5), IN `edTime` VARCHAR(5))
BEGIN
INSERT INTO CourseTimeslot (CourseId, Day, startTime, endTime) VALUES (crsId, crsDay, strtTime, edTime);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_deleteCourse`(
    IN crsId int
)
BEGIN

DELETE
FROM CourseRegistration
WHERE CourseId = crsId;
DELETE
FROM CourseTimeslot
WHERE CourseId = crsId;
DELETE
FROM Course
Where CourseId = crsId;

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_getAllCourses`()
BEGIN
	SELECT CourseId, name, shortName
	FROM Course;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_createApiUsage`(
    IN mthd VARCHAR(10),
    IN pth VARCHAR(200)
)
BEGIN
INSERT INTO ApiUsage (Method, Pathname) VALUES (mthd, pth);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_getCourseTimeslot`(
    IN crsId int
)
BEGIN
SELECT *
FROM CourseTimeslot
WHERE CourseId = crsId;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_deleteCourseTimeslots`(
    IN crsId int
)
BEGIN
DELETE
FROM CourseTimeslot
WHERE CourseId = crsId;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_getOneCourseDetails`(IN `crsId` INT)
BEGIN
	SELECT *
    FROM Course
    WHERE CourseId = crsId
    LIMIT 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_getListOfActiveStudentsInCourse`(IN `crsId` INT)
BEGIN
SELECT cr.StudentId, s.Username, s.name
FROM CourseRegistration cr INNER JOIN Student s
	on cr.StudentId = s.StudentId
WHERE cr.CourseId = crsId;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_getApiStats`()
BEGIN
SELECT COUNT(*) AS 'Hits', `Method`, `Pathname` FROM `ApiUsage` GROUP BY `Method`, `Pathname` ORDER BY COUNT(*) DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_studentLogin`(IN `Usernm` VARCHAR(100), IN `Pass` VARCHAR(100))
BEGIN
SELECT COUNT(*) AS 'valid', StudentId AS 'id'
    FROM slokme_d3l.Student s 
    WHERE (s.Username = Usernm) 
    AND (s.Password = Pass);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_updateCourse`(
    IN crsId int,
    IN crsName varchar(100),
    IN shrtName varchar(20)
)
BEGIN
UPDATE Course
SET Name = crsName,
	shortName = shrtName
WHERE CourseId = crsId;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_registerApiAdmin`(
    IN user VARCHAR(100),
    IN pass VARCHAR(100)
)
BEGIN
INSERT INTO apiAdmin (Username, Password) VALUES (user, pass);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_registerStudentToCourse`(IN `stdId` INT, IN `crsId` INT)
BEGIN
	INSERT INTO CourseRegistration (StudentId, CourseId, Status) VALUES (stdId, crsId, 'A');
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_updateStudent`(
    IN stdId int,
    IN userNm varchar(100),
    IN pw varchar(100),
    IN nme varchar(100)
)
BEGIN
UPDATE Student 
SET Username = userNm, 
    Password = pw,
    Name = nme
WHERE StudentId = stdId;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE `sp_removeStudentFromCourse`(
    IN crsId int,
    IN stdId int
)
BEGIN
DELETE
FROM CourseRegistration
WHERE CourseId = crsId
AND StudentId = stdId;
END$$
DELIMITER ;
