(function () {
        angular.module('app')
                .controller('AdminCtrl', function (currentAuth, $scope, $firebaseObject, $firebaseArray) {
                        var user = currentAuth.uid;
                        var userRef = firebase.database().ref().child('users/' + user);
                        $scope.user = $firebaseObject(userRef);

                        //skaffar dagens datum, används för andra funktioner
                        var date = new Date();
                        var today = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                        var time = function () {
                                var date = new Date();
                                return ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2) + ':' + ('00' + date.getSeconds()).slice(-2);
                        }

                        //funktion för veckonummer, den finns ej i standard javascript så jag hittade en som funkar på stackoverflow
                        Date.prototype.getWeek = function () {
                                var onejan = new Date(this.getFullYear(), 0, 1);
                                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                        };

                        //adminTabbar
                        $scope.adminTab = 'news';
                        $scope.setAdminTab = function (tab) {
                                $scope.adminTab = tab;
                        };

                        //admin nyheter
                        $scope.adminNewsTab = 'read';
                        $scope.setAdminNewsTab = function (tab) {
                                $scope.adminNewsTab = tab;
                        };
                        var newsRef = firebase.database().ref().child('news');
                        var regNewsRef = newsRef.child('general');
                        var adminNewsRef = newsRef.child('adminsOnly');

                        $scope.newsIndex = 0;

                        $scope.allNews = [];
                        newsRef.once('value').then(function (data) {
                                data.forEach(function (forWho) {
                                        var who = forWho.key;
                                        forWho.forEach(function (dates) {
                                                var datekey = dates.key;
                                                var news = dates.val();
                                                var date = datekey.substring(0, 10);
                                                var time = datekey.substring(11, 19);
                                                var newsItem = {
                                                        title: news.title,
                                                        content: news.content,
                                                        forWho: who,
                                                        datekey: datekey,
                                                        date: date,
                                                        time: time
                                                };
                                                $scope.allNews.push(newsItem);
                                        });
                                        $scope.allNews.sort(compare);
                                });
                        });

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
                        }

                        $scope.newsType = 'general';
                        $scope.newsTypeName = 'Nyhetstyp';
                        $scope.setNewsType = function (type, name) {
                                $scope.newsType = type;
                                $scope.newsTypeName = name;
                        };

                        $scope.createNews = function (news, title, type) {
                                var ref = firebase.database().ref().child('news/' + type + '/' + today + '_' + time());
                                ref.set({
                                        content: news,
                                        title: title
                                });
                        };

                        //admin Klass tabbar
                        $scope.adminClassTab = 'create';
                        $scope.setAdminClassTab = function (tab) {
                                $scope.adminClassTab = tab;
                        };

                        //admin kurs tabbar
                        $scope.adminCourseTab = 'create';
                        $scope.setAdminCoursesTab = function (tab) {
                                $scope.adminCourseTab = tab;
                                if (tab === 'courseDetails') {
                                        var cRef = firebase.database().ref().child('courses/courseNames');
                                        $scope.allCourses = $firebaseArray(cRef);
                                }
                        }
                        //admin kurser
                        $scope.createCourse = function (code, name, description) {
                                var ref = firebase.database().ref().child('courses/' + code);
                                ref.set({
                                        id: code,
                                        title: name,
                                        description: description
                                })
                                var cref = firebase.database().ref().child('courses/courseNames');
                                cref.update({
                                        [code]: true
                                });
                        };
                        $scope.courseDetailChoice = 'Välj kurs';
                        $scope.setChosenCourseForDetails = function (name) {
                                $scope.courseDetailChoice = name;
                                var courseDetailRef = firebase.database().ref().child('courses/' + name + '/details');
                                $scope.courseDetails = $firebaseObject(courseDetailRef);
                                var courseBooksRef = firebase.database().ref().child('courses/' + name + '/books');
                                $scope.courseBooks = $firebaseArray(courseBooksRef);
                        };

                        $scope.addCourseBook = function (title, content) {
                                var makeBookRef = firebase.database().ref().child('courses/' + $scope.courseDetailChoice + '/books');
                                makeBookRef.update({
                                        [title]: content
                                });
                        };

                        $scope.removeCourseBook = function (id) {
                                var bookRef = firebase.database().ref().child('courses/' + $scope.courseDetailChoice + '/books/' + id);
                                console.log(id);
                                bookRef.remove();
                        };

                        $scope.uppdateCourse = function (title, content, gReq, vgReq) {
                                // $scope.courseDetailChoice = '';
                                var courseUpdateRef = firebase.database().ref().child('courses/' + $scope.courseDetailChoice + '/details');
                                courseUpdateRef.update({
                                        title: title,
                                        content: content,
                                        goals: {
                                                G: gReq,
                                                VG: vgReq
                                        }
                                })
                        };

                        //admin klasser
                        $scope.createClass = function (name, school) {
                                var nameRef = firebase.database().ref().child('schools/schoolName');
                                nameRef.update({
                                        [school]: true
                                })
                                var ref = firebase.database().ref().child('schools/' + school + '/classes/' + name);
                                ref.set({
                                        placeholder: true
                                })
                                $scope.chosenSchool = 'Välj skola';
                                $scope.chosenClass = 'Välj klass'
                        };
                        $scope.showSchools = [];
                        var schoolsRef = firebase.database().ref().child('schools/schoolName');
                        schoolsRef.once('value').then(function (data) {
                                data.forEach(function (dataSnap) {
                                        $scope.showSchools.push({
                                                name: dataSnap.key
                                        });
                                })
                        });
                        $scope.chosenSchool = 'Välj skola';
                        $scope.showClasses = [];
                        $scope.studentListForClasses = [];
                        $scope.showClassList = function (school) {
                                $scope.chosenClass = 'Välj klass';
                                $scope.chosenSchool = school;
                                var classes = [];
                                var classRef = firebase.database().ref().child('schools/' + school + '/classes');
                                // $scope.showClasses = $firebaseArray(classRef);
                                classRef.once('value').then(function (data) {
                                        $scope.showClasses = [];
                                        var classes = $firebaseArray(classRef);
                                        data.forEach(function (dataSnap) {
                                                console.log(dataSnap.key);
                                                $scope.showClasses.push({
                                                        name: dataSnap.key,
                                                        school: school
                                                });
                                        })
                                });
                                var studentsRef = firebase.database().ref().child('schools/' + school + '/students');
                                var students = [];
                                $scope.studentListForClasses = [];
                                studentsRef.once('value').then(function (data) {
                                        data.forEach(function (snapshot) {
                                                students.push(snapshot.key);
                                        })
                                        // console.log(students);
                                        students.forEach(function (student) {
                                                var getStudentsRef = firebase.database().ref().child('users/' + student + '/name');
                                                var studentnames = $firebaseArray(getStudentsRef);
                                                getStudentsRef.once('value').then(function (data) {
                                                        // console.log(student);
                                                        $scope.studentListForClasses.push({
                                                                name: data.val(),
                                                                uid: student
                                                        });
                                                })
                                        })
                                });
                                var teacherRef = firebase.database().ref().child('schools/' + school + '/teachers');
                                var teacher = [];
                                $scope.teacherListForClasses = [];
                                teacherRef.once('value').then(function (data) {
                                        data.forEach(function (snapshot) {
                                                teacher.push(snapshot.key);
                                        })
                                        // console.log(teacher);
                                        teacher.forEach(function (teacher) {
                                                var getTeacherRef = firebase.database().ref().child('users/' + teacher + '/name');
                                                var teachernames = $firebaseArray(getTeacherRef);
                                                getTeacherRef.once('value').then(function (data) {
                                                        // console.log(student);
                                                        $scope.teacherListForClasses.push({
                                                                name: data.val(),
                                                                uid: teacher
                                                        });
                                                })
                                        })
                                })
                        };
                        $scope.chosenClass = 'Välj klass';
                        $scope.showMembersListForClass = function (school, theClass) {
                                $scope.chosenClass = theClass;
                                $scope.classMemberList = [];
                                var sRef = firebase.database().ref().child('schools/' + school + '/classes/' + theClass + '/student');
                                var tRef = firebase.database().ref().child('schools/' + school + '/classes/' + theClass + '/teacher');
                                $scope.classMemberListStudents = $firebaseArray(sRef);
                                $scope.classMemberListTeachers = $firebaseArray(tRef);

                        };
                        $scope.setActiveMemberInClassList = function (id, name, type) {
                                $scope.activeMemberInClassList = {
                                        id: id,
                                        name: name,
                                        type: type
                                };
                        };
                        $scope.setActiveMemberForClassList = function (id, name, type) {
                                $scope.activeMemberForClassList = {
                                        id: id,
                                        name: name,
                                        type: type
                                };
                        }
                        $scope.transferToClass = function (id, name, type) {
                                var ref = firebase.database().ref().child('schools/' + $scope.chosenSchool + '/classes/' + $scope.chosenClass + '/' + type);
                                ref.update({
                                        [id]: name
                                })
                                var sRef = firebase.database().ref().child('users/' + id + '/groups/school/' + $scope.chosenSchool + '/class');
                                sRef.update({
                                        [$scope.chosenClass]: true
                                })
                        };
                        $scope.transferFromClass = function (id, type) {
                                var ref = firebase.database().ref().child('schools/' + $scope.chosenSchool + '/classes/' + $scope.chosenClass + '/' + type + '/' + id);
                                ref.remove()
                                        .then(
                                        console.log('Remove successfull')
                                        );
                                var sRef = firebase.database().ref().child('users/' + id + '/groups/school/' + $scope.chosenSchool + '/class' + $scope.chosenClass);
                                sRef.remove();
                                $scope.activeMemberInClassList = "";
                        }

                        //admin användare
                        $scope.createUser = function (fname, lname, email, password, type, school) {
                                var config = {
                                        apiKey: "AIzaSyB3UdUl1As-W_3gHCf-aDadJw0myIOvdR8",
                                        authDomain: "schoolweb-35754.firebaseapp.com",
                                        databaseURL: "https://schoolweb-35754.firebaseio.com"
                                };
                                var secondaryApp = firebase.initializeApp(config, "Secondary");
                                secondaryApp.auth().createUserWithEmailAndPassword(email, password).then(function (firebaseUser) {
                                        var ref = firebase.database().ref().child('users/' + firebaseUser.uid);
                                        ref.set({
                                                email: email,
                                                firstName: fname,
                                                lastName: lname,
                                                name: fname + ' ' + lname,
                                                type: type,
                                                groups: {
                                                        school: {
                                                                name: {
                                                                        [school]: true
                                                                }
                                                        }
                                                }
                                        });
                                        var sRef = firebase.database().ref().child('schools/' + school + '/' + type + 's');
                                        sRef.update({
                                                [firebaseUser.uid]: true
                                        });
                                        console.log("User " + firebaseUser.uid + " created successfully!");
                                        secondaryApp.auth().signOut();
                                });
                        };
                        //veckofeedbacktabbar
                        $scope.adminFeedbackTab = 'create';
                        $scope.setAdminFeedbackTab = function (tab) {
                                $scope.adminFeedbackTab = tab;
                        }

                        //skapa veckofeedback
                        var weekFeedbackFormRef = firebase.database().ref().child('feedback/weekly/' + date.getFullYear() + "_" + + date.getWeek() + '/form');
                        $scope.weekFeedbackType = 'Svarsalternativ';
                        $scope.setWeeklyFeedbackAnswerType = function (type) {
                                $scope.weekFeedbackType = type;
                        };
                        $scope.weeklyFeedbackForm = $firebaseArray(weekFeedbackFormRef);
                        $scope.addWeeklyFeedbackQuestion = function (text, type) {
                                if (type != 'Svarsalternativ') {
                                        weekFeedbackFormRef.push({
                                                question: text,
                                                type: type
                                        });
                                };
                        };

                        //läs veckofeedback
                        var weekFeedbackWeekRef = firebase.database().ref().child('feedback/weekly');
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
                                                        console.log(form.key);
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
})();