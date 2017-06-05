(function () {
    angular.module('app')
        .controller('TeacherCtrl', function (currentAuth, ScheduleTimes, DailyFeedbackList, AttendanceList, $location, $scope, $firebaseObject, $firebaseArray) {

            // var switchRef = firebase.database().ref().child('news');
            // switchRef.once('value').then(function(data){
            //     switchRef.child('Newton/YAPP-APP').set(data.val());
            // })

            var user = currentAuth.uid;
            var userRef = firebase.database().ref().child('users/' + user);
            $scope.user = $firebaseObject(userRef);
            userRef.once('value').then(function (data) {
                var type = data.val().type;
                if (type !== 'teacher') {
                    $location.path('/' + type);
                }
            });
            var myClass = '';
            var mySchool = '';
            $scope.newsLoaded = 0;
            $scope.userLoaded = 0;
            $scope.studentsLoaded = 0;
            userRef.child('groups/school').once('value').then(function (data) {
                data.forEach(function (school) {
                    mySchool = school.key;
                    school.forEach(function (classes) {
                        if (classes.key === 'class') {
                            classes.forEach(function (theClass) {
                                myClass = theClass.key;

                            })
                        }
                    })
                });
                var classRef = firebase.database().ref().child('schools/' + mySchool + '/classes/' + myClass);
                var myStudents = classRef.child('student');
                var studentIds = [];
                console.log(mySchool + ' + ' + myClass);
                $scope.userLoaded = 1;

                //skaffar dagens datum, används för andra funktioner
                var date = new Date();
                var today = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                var time = function () {
                    var date = new Date();
                    return ('00' + date.getHours()).slice(-2) + '-' + ('00' + date.getMinutes()).slice(-2) + '-' + ('00' + date.getSeconds()).slice(-2);
                }

                //funktion för veckonummer, den finns ej i standard javascript så jag hittade en som funkar på stackoverflow
                Date.prototype.getWeek = function () {
                    var onejan = new Date(this.getFullYear(), 0, 1);
                    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                }

                $scope.teacherTab = 'news';
                $scope.setMainTab = function (tab) {
                    $scope.teacherTab = tab;
                };

                var user = currentAuth.uid;

                //lärarens nyheter

                var teacherNewsRef = firebase.database().ref().child('news/' + mySchool + '/' + myClass);

                $scope.teacherNews = [];

                $scope.newsIndex = 0;
                $scope.moreNews = function () {
                    $scope.newsIndex = $scope.newsIndex + 2;
                }
                teacherNewsRef.once('value').then(function (data) {
                    data.forEach(function (newsId) {
                        newsId.forEach(function (news) {
                            $scope.teacherNews.push({
                                content: news.val().content,
                                title: news.val().title,
                                type: newsId.key,
                                date: news.key.substring(0, 10),
                                time: news.key.substring(11, 19)
                            });
                        });
                    });
                    $scope.newsLoaded = 1;
                });






                //kurs schema

                var myCourse = '';
                var myCoursesRef = userRef.child('groups/school/' + mySchool + '/courses');
                $scope.myCourses = $firebaseArray(myCoursesRef);

                $scope.pickCourseScheduleSelected = 'Välj Kurs';
                $scope.setPickCourseScheduleSelected = function (course) {
                    $scope.pickCourseScheduleSelected = course;
                    var myCourse = course;

                    var scheduleRef = firebase.database().ref().child('courses/' + myCourse + '/details/schedule');
                    $scope.mySchedule = $firebaseArray(scheduleRef);

                    $scope.selectStartTime = ScheduleTimes;
                    $scope.scheduleTimeStartSelected = {
                        time: 'Välj tid',
                        index: 0
                    };
                    $scope.selectEndTime = ScheduleTimes;
                    $scope.scheduleTimeEndSelected = {
                        time: 'Välj tid',
                        index: 0
                    };
                    $scope.setScheduleTimeStartSelected = function (time, index) {
                        $scope.scheduleTimeStartSelected = {
                            time: time,
                            index: index
                        }
                    };
                    $scope.setScheduleTimeEndSelected = function (time, index) {
                        $scope.scheduleTimeEndSelected = {
                            time: time,
                            index: index
                        }
                    };
                    var courseBooksRef = firebase.database().ref().child('courses/' + myCourse + '/books');
                    $scope.courseBooks = $firebaseArray(courseBooksRef);
                    $scope.todaysCourseBooks = [];
                    $scope.addCourseBook = function (book) {
                        $scope.todaysCourseBooks.push(book);
                    };

                    $scope.addDateToSchedule = function (theDate, timeStart, timeEnd, momentum) {
                        var newDate = theDate.getFullYear() + '-' + ('0' + (theDate.getMonth() + 1)).slice(-2) + '-' + ('0' + theDate.getDate()).slice(-2);
                        scheduleRef.update({
                            [newDate]: {
                                time: timeStart + ' - ' + timeEnd,
                                momentum: momentum
                            }
                        })
                        $scope.todaysCourseBooks.forEach(function (data) {
                            scheduleRef.child(newDate + '/books').update({
                                [data.$id]: data.$value
                            })
                        });
                    };
                }

                //hantera närvaro

                $scope.attendanceTab = 'daily';
                $scope.setAttendanceTab = function (tab) {
                    $scope.attendanceTab = tab;
                }

                var usersRef = firebase.database().ref().child('users');
                var attendanceRef = firebase.database().ref().child('attendance/' + mySchool + '/' + myClass);

                var students = [];
                $scope.students = [];
                usersRef.once('value')
                    .then(function (data) {
                        data.forEach(function (childSnapshot) {
                            var childData = childSnapshot.val();
                            var studentId = childSnapshot.key;
                            if (childData.type === 'student') {
                                // console.log(childSnapshot.key);
                                var studentInfo = {
                                    firstName: childData.firstName,
                                    lastName: childData.lastName,
                                    id: studentId,
                                    attendance: AttendanceList(today, studentId)
                                };
                                $scope.students.push(studentInfo);
                            };
                        });
                        // console.log($scope.students);
                        $scope.studentsLoaded = 1;
                    });
                var attendance = $firebaseArray(attendanceRef);
                // $scope.studentAttendanceStats = attendance;
                $scope.studentAttendanceStats = [];
                $scope.attendanceDates = [];

                myStudents.once('value').then(function (myClassStudents) {
                    attendanceRef.once('value').then(function (data) {
                        data.forEach(function (dates) {
                            $scope.attendanceDates.push(dates.key);
                        });
                        myClassStudents.forEach(function (student) {
                            studentIds.push({
                                name: student.val(),
                                id: student.key
                            });
                        });
                        studentIds.forEach(function (studentId) {
                            var studentAttendStats = [];
                            $scope.attendanceDates.forEach(function (date) {
                                attendanceRef.child(date + '/' + studentId.id).once('value').then(function (attend) {
                                    var status = 0;
                                    if (attend.exists()) {
                                        status = attend.val().status;
                                    } else {
                                        status = 0;
                                    };
                                    studentAttendStats.push({
                                        date: date,
                                        attend: status
                                    });
                                    // console.log(date + ': ' + studentId.name + ': ' + attend.val().status);
                                });
                                // console.log(date + ' + ' + studentId.name);
                            })
                            $scope.studentAttendanceStats.push({
                                name: studentId.name,
                                id: studentId.id,
                                attendance: studentAttendStats
                            })
                        })
                    });
                    // console.log($scope.studentAttendanceStats);
                })

                //feedback för lärare
                $scope.feedbackTab = 'daily';
                $scope.setFeedbackTab = function (tab) {
                    $scope.feedbackTab = tab;
                }

                //läs daglig feedback
                $scope.dailyFeedbackIndex = 0;
                $scope.increaseDailyFeedbackIndex = function () {
                    $scope.dailyFeedbackIndex = $scope.dailyFeedbackIndex + 2;
                };
                var feedbackRef = firebase.database().ref().child('feedback/' + mySchool + '/' + myClass);
                var dailyFeedbackRef = feedbackRef.child('daily');
                $scope.dailyFeedback = $firebaseArray(dailyFeedbackRef);

                //läs veckofeedback
                var weekFeedbackWeekRef = feedbackRef.child('weekly');
                $scope.feedBackWeeks = [];
                weekFeedbackWeekRef.once('value').then(function (data) {
                    data.forEach(function (week) {
                        if (week.key !== 'default') {
                            $scope.feedBackWeeks.push(week.key);
                        }
                    })
                    // console.log($scope.feedBackWeeks);
                });
                $scope.feedbackWeekSelect = 'Välj vecka';
                $scope.feedbackQuestionSelect = { question: 'Välj fråga' };
                $scope.weeklyFeedbackSelectForViewQuestion = function (question) {
                    $scope.feedbackQuestionSelect = question;
                }
                $scope.feedBackWeeksQuestion = [];
                var ticker = 0;
                $scope.showFeedback = [];
                $scope.weeklyFeedbackSelectForView = function (week) {
                    $scope.showFeedback = [];
                    $scope.feedbackWeekSelect = week;
                    weekFeedbackWeekRef.child(week + '/form').once('value').then(function (data) {
                        if (data.val()) {
                            data.forEach(function (form) {
                                // console.log(form.key);
                                $scope.feedBackWeeksQuestion.push({
                                    question: form.val().question,
                                    id: form.key
                                })
                            });
                            getWeeklyQuestions(week);
                        } else {
                            weekFeedbackWeekRef.child('default').once('value').then(function (data) {
                                data.forEach(function (data) {
                                    console.log(data.key);
                                    $scope.feedBackWeeksQuestion.push({
                                        question: data.val().question,
                                        id: data.key
                                    })
                                });
                                getWeeklyQuestions(week);
                            });
                        }
                        // console.log(data.val());
                    })
                }
                var getWeeklyQuestions = function (week) {
                    weekFeedbackWeekRef.child(week + '/answers').once('value').then(function (data) {
                        data.forEach(function (answers) {
                            var temp = [];
                            answers.forEach(function (snap) {
                                temp.push({
                                    answer: snap.val(),
                                    id: snap.key
                                })
                            })
                            $scope.showFeedback.push(temp);
                        })
                        console.log($scope.showFeedback);
                    })
                    var showFeedback = $firebaseArray(weekFeedbackWeekRef.child(week + '/answers'));
                }
            });
            $scope.showAll = $scope.userLoaded * $scope.newsLoaded * $scope.studentsLoaded;
        });
})();