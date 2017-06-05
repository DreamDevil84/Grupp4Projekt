(function () {
    angular.module('app')
        .controller('StudentCtrl', function (currentAuth, $firebaseObject, $firebaseArray, $scope, $location) {

            //referenser initieras
            var user = currentAuth.uid;
            var userRef = firebase.database().ref().child('users/' + user);
            $scope.user = $firebaseObject(userRef);
            userRef.once('value').then(function (data) {
                var type = data.val().type;
                if (type !== 'student') {
                    $location.path('/' + type);
                }
            });
            var mySchool = '';
            var myClass = '';
            userRef.child('groups/school').once('value').then(function (data) {
                data.forEach(function (school) {
                    mySchool = school.key;
                    school.forEach(function (classes) {
                        classes.forEach(function (theClass) {
                            myClass = theClass.key;
                        })
                    })
                })
                var courseRef = firebase.database().ref().child('courses');
                var userCourseRef = userRef.child('/courses');
                var studentNewsRef = firebase.database().ref().child('news/' + mySchool + '/' + myClass);

                //tabs för studenten
                $scope.mainTab = 'daily';
                $scope.setMainTab = function (tab) {
                    $scope.mainTab = tab;
                };

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
                };

                //här filtreras alla kurser som studenten läser in i ett nytt array, även betyget trycks in där, nyheter filtreras även här
                var studentCourses = [];
                $scope.studentCourseDetails = [];
                $scope.studentNews = [];
                userCourseRef.once('value')
                    .then(function (data) {
                        data.forEach(function (childDataSnap) {
                            var childData = childDataSnap.val();
                            var childDetail = {
                                id: childDataSnap.key,
                                grade: childData.grade,
                                status: childData.status,
                                gradeWork: childData.gradeWork
                            };
                            studentCourses.push(childDetail);
                        });
                        courseRef.once('value')
                            .then(function (data) {
                                data.forEach(function (course) {
                                    for (var x = 0; x < studentCourses.length; x++) {
                                        if (course.key === studentCourses[x].id) {
                                            $scope.studentCourseDetails.push({
                                                id: studentCourses[x].id,
                                                grade: studentCourses[x].grade,
                                                title: course.val().title,
                                                description: course.val().description,
                                                gradeReq: course.val().gradeReq,
                                                details: course.val().details,
                                                status: studentCourses[x].status,
                                                gradeWork: studentCourses[x].gradeWork
                                            });
                                            break;
                                        };
                                    };
                                });
                            });
                        //nyheter för studenten
                        studentNewsRef.once('value')
                            .then(function (types) {
                                types.forEach(function (data) {
                                    for (var x = 0; x < studentCourses.length; x++) {
                                        if (data.key === studentCourses[x].id || data.key === 'general') {
                                            data.forEach(function (dates) {
                                                $scope.studentNews.push({
                                                    content: dates.val().content,
                                                    title: dates.val().title,
                                                    datekey: dates.key,
                                                    type: data.key,
                                                    date: dates.key.substring(0, 10),
                                                    time: dates.key.substring(11, 19)
                                                });
                                            });
                                            break;
                                        };
                                    };
                                });
                                // console.log($scope.studentNews);
                            });
                        $scope.studentNews.sort(compare);
                        $scope.newsIndex = 0;
                    });
                var courses = $firebaseArray(courseRef);
                var studentNews = $firebaseArray(studentNewsRef);

                //används för att sortera nyheter
                var compare = function (a, b) {
                    if (a.datekey > b.datekey) {
                        return -1;
                    };
                    if (a.datekey < b.datekey) {
                        return 1;
                    };
                    return 0;
                };

                $scope.moreNews = function () {
                    $scope.newsIndex = $scope.newsIndex + 2;
                };

                $scope.showCourseTab = 'details';
                $scope.setCourseTab = function (tab) {
                    $scope.showCourseTab = tab;
                };


                $scope.gototest = function () {
                    $location.path('/test');
                };


                //feedback funktioner

                //ge feedback, 2 parametrar, första är värdet på rösten, andra är vilken typ, tex daglig eller veckans

                var feedbackRef = firebase.database().ref().child('feedback/' + mySchool + '/' + myClass);
                var fRef = feedbackRef.child('daily/' + today + '/hasVoted/' + user);
                fRef.on('value', function (data) {
                    if (data.exists()) {
                        $scope.gaveFeedbackToday = true;
                        fRef.off('value');
                    };
                });

                $scope.giveFeedback = function (reaction, type, text) {
                    text = 'tomt';
                    var giveDailyFeedbackRef, feedbackRecordRef;
                    if (type === 'daily') {
                        giveDailyFeedbackRef = feedbackRef.child('daily/' + today);
                        feedbackRecordRef = feedbackRef.child('daily/' + today + '/hasVoted/' + user);
                        text = null;
                    } else if (type === 'weekly') {
                        var thisWeek = date.getWeek();
                        giveDailyFeedbackRef = feedbackRef.child('weekly/' + thisWeek);
                        feedbackRecordRef = feedbackRef.child('weekly/' + thisWeek + '/hasVoted/' + user);
                    };
                    $scope.record = $firebaseArray(feedbackRecordRef);

                    giveDailyFeedbackRef.once('value').then(function (snapshot) {
                        if (snapshot.child('hasVoted/' + user).exists()) {
                            console.log('exists');
                        } else {
                            if (!snapshot.child('likes').exists()) {
                                giveDailyFeedbackRef.set({
                                    votes: 1,
                                    likes: reaction,
                                    hasVoted: {
                                        [user]: {
                                            theirVote: reaction,
                                            text: text
                                        }
                                    }
                                });
                            } else {
                                giveDailyFeedbackRef.update({
                                    likes: snapshot.val().likes + reaction,
                                    votes: snapshot.val().votes + 1
                                });
                                feedbackRecordRef.set({
                                    theirVote: reaction,
                                    text: text
                                });
                            }
                        }
                    })

                };

                //veckans feedback
                var weeklyFeedbackRef = feedbackRef.child('weekly/');
                var weeklyFeedbackFormRef = weeklyFeedbackRef.child(date.getFullYear() + "_" + date.getWeek() + '/form');
                var weeklyFeedbackAnswerRef = weeklyFeedbackRef.child(date.getFullYear() + "_" + + date.getWeek() + '/answers');
                var weeklyFeedbackAnswerDoneRef = weeklyFeedbackRef.child(date.getFullYear() + "_" + + date.getWeek() + '/haveAnswered/' + user);

                var day = date.getDay();
                //if (day === 0 || day === 5 || day === 6) {

                if (day >= 0) { //för utveckling
                    weeklyFeedbackAnswerDoneRef.on('value', function (data) {
                        if (data.val()) {
                            $scope.timeForWeeklyFeedback = 0;
                            weeklyFeedbackAnswerDoneRef.off('value');
                        } else {
                            $scope.timeForWeeklyFeedback = 1;
                            weeklyFeedbackFormRef.once('value').then(function (form) {
                                if (form.val()) {
                                    $scope.weeklyFeedback = $firebaseArray(weeklyFeedbackFormRef);
                                }
                                else {
                                    $scope.weeklyFeedback = $firebaseArray(weeklyFeedbackRef.child('default'));
                                }
                            })
                            $scope.weeklyFeedbackValue = [];
                            $scope.setWeeklyFeedbackChoice = function (id, val) {
                                $scope.weeklyFeedbackValue[id] = val;
                            };
                        };
                    });
                };
                $scope.sendWeeklyFeedback = function () {
                    weeklyFeedbackAnswerDoneRef.once('value').then(function (data) {
                        if (data.exists()) {
                            console.log('already gave feedback');
                        } else {
                            $scope.weeklyFeedback.forEach(function (data) {
                                var show = 0;
                                if (data.type === 'Text') {
                                    show = document.getElementById(data.$id).value;
                                    $scope.weeklyFeedbackValue[data.$id] = show;
                                }
                            });
                            weeklyFeedbackAnswerRef.child(weeklyFeedbackAnswerRef.push().key).set($scope.weeklyFeedbackValue);
                            weeklyFeedbackAnswerDoneRef.set(true);
                            weeklyFeedbackAnswerDoneRef.off('value');
                        };
                    });
                    $scope.timeForWeeklyFeedback = 0;
                    $scope.setMainTab('daily');
                };
                //NÄRVARO
                var attRef = firebase.database().ref().child('attendance/' + mySchool + '/' + myClass);
                var attendanceRef = attRef.child(today + '/' + user);

                var syncAttend = $firebaseObject(attendanceRef);
                syncAttend.$bindTo($scope, 'data');

                $scope.attendance = function () {
                    attendanceRef.once('value').then(function (attend) {
                        if (!attend.exists()) {
                            attendanceRef.set({
                                status: 3
                            });
                        } else {
                            // console.log(attend.val().status);
                            if (attend.val().status === 3) {
                                attendanceRef.update({
                                    status: 2
                                });
                            } else if (attend.val().status === 2) {
                                attendanceRef.update({
                                    status: 1
                                });
                            } else if (attend.val().status === 1) {
                                attendanceRef.update({
                                    status: 3
                                });
                            }
                        };
                    });
                };
            });
        });
})();