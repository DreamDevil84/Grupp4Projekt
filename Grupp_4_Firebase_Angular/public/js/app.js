(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB3UdUl1As-W_3gHCf-aDadJw0myIOvdR8",
        authDomain: "schoolweb-35754.firebaseapp.com",
        databaseURL: "https://schoolweb-35754.firebaseio.com",
        projectId: "schoolweb-35754",
        storageBucket: "schoolweb-35754.appspot.com",
        messagingSenderId: "387758932838"
    };
    firebase.initializeApp(config);

    angular
        .module('app', ['firebase', 'ngRoute'])
        .factory('Auth', function ($firebaseAuth) {
            return $firebaseAuth();
        })
        .controller('LoginCtrl', function ($scope, Auth, $firebaseObject, $location) {
            $scope.auth = Auth;

            //Hämtar ett värde från databasen som visar vilken sorts användare det är
            $scope.auth.$onAuthStateChanged(function (firebaseUser) {
                $scope.firebaseUser = firebaseUser;
                if ($scope.firebaseUser) {
                    var ref = firebase.database().ref().child('users/' + $scope.firebaseUser.uid);
                    // console.log($scope.firebaseUser.uid);
                    var login = $firebaseObject(ref);
                    login.$loaded().then(function (user) {
                        // console.log(user.type);
                        $location.path('/' + user.type);
                    });
                } else {
                    $location.path('/home');
                };
            });
            $scope.email = 'student@edu.com';
            $scope.password = '123456';


        })
        //denna function är till för att se om användaren inte är autensierad och blir då sparkad till förstasidan
        .run(function ($rootScope, $location) {
            $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
                if (error === 'AUTH_REQUIRED') {
                    $location.path('/home');
                    console.log('AUTH REQUIRED');
                }
            });
        })
        .config(function ($routeProvider) {
            $routeProvider.when(
                '/home',
                {
                    controller: 'HomeCtrl',
                    templateUrl: 'views/home/home.html',
                    resolve:
                    {
                        'currentAuth': function (Auth) {
                            return Auth.$waitForSignIn();
                        }
                    }
                }).when(
                '/admin',
                {
                    controller: 'AdminCtrl',
                    templateUrl: 'views/admin/home.html',
                    resolve:
                    {
                        'currentAuth': function (Auth) {
                            return Auth.$requireSignIn();
                        }
                    }
                }).when(
                '/student',
                {
                    controller: 'StudentCtrl',
                    templateUrl: 'views/student/home.html',
                    resolve:
                    {
                        'currentAuth': function (Auth) {
                            return Auth.$requireSignIn();
                        }
                    }
                }).when(
                '/teacher',
                {
                    controller: 'TeacherCtrl',
                    templateUrl: 'views/teacher/home.html',
                    resolve:
                    {
                        'currentAuth': function (Auth) {
                            return Auth.$requireSignIn();
                        }
                    }
                }).when(
                '/test',
                {
                    templateUrl: 'views/student/test.html'
                });
        })
        .controller('HomeCtrl', function (currentAuth) {
        })
        .controller('StudentCtrl', function (currentAuth, $firebaseObject, $firebaseArray, $scope, $location) {

            //referenser initieras
            var user = currentAuth.uid;
            var courseRef = firebase.database().ref().child('courses');
            var userCourseRef = firebase.database().ref().child('users/' + user + '/courses');
            var userRef = firebase.database().ref().child('users/' + user);
            var studentNewsRef = firebase.database().ref().child('news/general');
            $scope.user = $firebaseObject(userRef);

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

            //nyheter för studenten
            $scope.studentNews = [];
            studentNewsRef.once('value')
                .then(function (data) {
                    data.forEach(function (dates) {
                        var datekey = dates.key;
                        var news = dates.val();
                        var date = datekey.substring(0, 10);
                        var time = datekey.substring(11, 19);
                        var theNews = {
                            content: news.content,
                            title: news.title,
                            datekey: datekey,
                            date: date,
                            time: time
                        };
                        $scope.studentNews.push(theNews);
                    });
                    $scope.studentNews.sort(compare);
                    console.log($scope.studentNews);
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

            $scope.newsIndex = 0;
            $scope.moreNews = function () {
                $scope.newsIndex = $scope.newsIndex + 2;
            };


            //här filtreras alla kurser som studenten läser in i ett nytt array, även betyget trycks in där
            var studentCourses = [];
            $scope.studentCourseDetails = [];
            userCourseRef.once('value')
                .then(function (data) {
                    data.forEach(function (childDataSnap) {
                        var childData = childDataSnap.val();
                        var childDetail = {
                            id: childData.id,
                            grade: childData.grade,
                            status: childData.status,
                            gradeWork: childData.gradeWork
                        };
                        studentCourses.push(childDetail);
                    });
                    courseRef.once('value')
                        .then(function (data) {
                            data.forEach(function (childDataSnap) {
                                var childData = childDataSnap.val();
                                for (var x = 0; x < studentCourses.length; x++) {
                                    if (childData.id === studentCourses[x].id) {
                                        $scope.studentCourseDetails.push({
                                            id: studentCourses[x].id,
                                            grade: studentCourses[x].grade,
                                            title: childData.title,
                                            description: childData.description,
                                            gradeReq: childData.gradeReq,
                                            details: childData.details,
                                            status: studentCourses[x].status,
                                            gradeWork: studentCourses[x].gradeWork
                                        });
                                    };
                                };
                            })
                            // console.log($scope.studentCourseDetails);
                        });
                })
            var courses = $firebaseArray(courseRef);

            $scope.showTab = 1;
            $scope.setTab = function (tab) {
                $scope.showTab = tab;
            };


            $scope.gototest = function () {
                $location.path('/test');
            };


            //feedback funktioner

            //ge feedback, 2 parametrar, första är värdet på rösten, andra är vilken typ, tex daglig eller veckans, text är för veckofeedback

            var fref = firebase.database().ref().child('feedback/daily/' + today + '/hasVoted/' + user);
            fref.on('value', function (data) {
                if (data.exists()) {
                    $scope.gaveFeedbackToday = true;
                };
            });

            $scope.giveFeedback = function (reaction, type, text) {
                text = 'tomt';
                var feedbackRef, feedbackRecordRef;
                if (type === 'daily') {
                    feedbackRef = firebase.database().ref().child('feedback/daily/' + today);
                    feedbackRecordRef = firebase.database().ref().child('feedback/daily/' + today + '/hasVoted/' + user);
                    text = null;
                } else if (type === 'weekly') {
                    var thisWeek = date.getWeek();
                    feedbackRef = firebase.database().ref().child('feedback/weekly/' + thisWeek);
                    feedbackRecordRef = firebase.database().ref().child('feedback/weekly/' + thisWeek + '/hasVoted/' + user);
                };
                $scope.record = $firebaseArray(feedbackRecordRef);

                feedbackRef.once('value').then(function (snapshot) {
                    if (snapshot.child('hasVoted/' + user).exists()) {
                        console.log('exists');
                    } else {
                        if (!snapshot.child('likes').exists()) {
                            feedbackRef.set({
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
                            feedbackRef.update({
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

            //NÄRVARO

            var attendanceRef = firebase.database().ref().child('attendance/' + today + '/' + user);

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
                    }
                });
            };



            // var ref = firebase.database().ref().child('data');
            // var syncObject = $firebaseObject(ref);
            // syncObject.$bindTo($scope, 'data');

            // var msgRef = firebase.database().ref().child('messages');
            // $scope.messages = $firebaseArray(msgRef);
            // $scope.addMessage = function () {
            //     $scope.messages.$add({
            //         text: $scope.newMessageText
            //     });
            // };

        })
        .factory('AttendanceList', function ($firebaseObject) {

            return function (today, student) {
                // create a reference to the database node where we will store our data
                var ref = firebase.database().ref().child('attendance/' + today + '/' + student);
                // return it as a synchronized object
                return $firebaseObject(ref);
            }
        })
        .controller('TeacherCtrl', function (currentAuth, AttendanceList, $scope, $firebaseObject, $firebaseArray) {
            var user = currentAuth.uid;
            var userRef = firebase.database().ref().child('users/' + user);
            $scope.user = $firebaseObject(userRef);

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

            $scope.teacherTab = 'daily';
            $scope.setMainTab = function (tab) {
                $scope.teacherTab = tab;
            };

            var user = currentAuth.uid;

            //hämta studenterna
            var usersRef = firebase.database().ref().child('users');
            var attendanceRef = firebase.database().ref().child('attendance/' + today);

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
                    console.log($scope.students);
                });
            var attendance = $firebaseArray(attendanceRef);



        })
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


            //admin kurser
            $scope.createCourse = function (code, name, description) {
                var ref = firebase.database().ref().child('courses/' + code);
                ref.set({
                    id: code,
                    title: name,
                    description
                })
            };

            //admin användare
            $scope.createUser = function (fname, lname, email, password, type) {
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
                        type: type
                    });
                    console.log("User " + firebaseUser.uid + " created successfully!");
                    secondaryApp.auth().signOut();
                });
            };
        });



}());