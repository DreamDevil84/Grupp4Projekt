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


            //skaffar dagens datum, används för andra funktioner
            var date = new Date();
            var today = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();

            //funktion för veckonummer, den finns ej i standard javascript så jag hittade en som funkar på stackoverflow
            Date.prototype.getWeek = function () {
                var onejan = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            }

            //filtrera kurser för studenten
            var user = currentAuth.uid;
            var courseRef = firebase.database().ref().child('courses');
            var userRef = firebase.database().ref().child('users/' + user);
            var userCourseRef = firebase.database().ref().child('users/' + user + '/courses');


            //här filtreras alla kurser som studenten läser in i ett nytt array, även betyget trycks in där
            var studentCourses = [];
            $scope.studentCourseDetails = [];
            userCourseRef.once('value')
                .then(function (data) {
                    data.forEach(function (childDataSnap) {
                        var childData = childDataSnap.val();
                        var childDetail = { id: childData.id, grade: childData.grade };
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
                                            description: childData.description
                                        });
                                    };
                                };
                            })
                        });
                })
            var courses = $firebaseArray(courseRef);
            $scope.user = $firebaseObject(userRef);


            $scope.gototest = function () {
                $location.path('/test');
            };


            //feedback funktioner

            //ge feedback, 2 parametrar, första är värdet på rösten, andra är vilken typ, tex daglig eller veckans, text är för veckofeedback
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
                            status: 2
                        });
                    } else {
                        console.log(attend.val().status);
                        if (attend.val().status === 2) {
                            attendanceRef.update({
                                status: 1
                            });
                        } else if (attend.val().status === 1) {
                            attendanceRef.update({
                                status: 0
                            });
                        } else if (attend.val().status === 0) {
                            attendanceRef.update({
                                status: 2
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
        // .factory('AttendanceList', function ($firebaseObject) {

        //     return function (studentAtt) {
        //         // create a reference to the database node where we will store our data
        //         var ref = firebase.database().ref("rooms").push();
        //         var profileRef = ref.child(studentAtt);

        //         // return it as a synchronized object
        //         return $firebaseObject(profileRef);
        //     }
        // })
        .controller('TeacherCtrl', function (currentAuth, $scope, $firebaseObject, $firebaseArray) {

            //skaffar dagens datum, används för andra funktioner
            var date = new Date();
            var today = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();

            //funktion för veckonummer, den finns ej i standard javascript så jag hittade en som funkar på stackoverflow
            Date.prototype.getWeek = function () {
                var onejan = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            }

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
                                id: studentId
                            };
                            students.push(studentInfo);
                        };
                    });
                    // console.log(students);
                    attendanceRef.once('value')
                        .then(function (attendData) {
                            attendData.forEach(function (attendSnapshot) {
                                var childData = {
                                    status: attendSnapshot.val().status,
                                    id: attendSnapshot.key
                                };
                                // console.log(childData);
                                for (var x = 0; x < students.length; x++) {
                                    if (childData.id === students[x].id) {
                                        var studentsInfo = {
                                            firstName: students[x].firstName,
                                            id: childData.id,
                                            lastName: students[x].lastName,
                                            status: childData.status
                                        };
                                        $scope.students.push(studentsInfo);
                                    };
                                };
                            });
                        });
                    // console.log($scope.students);
                });
            var attendance = $firebaseArray(attendanceRef);



        })
        .controller('AdminCtrl', function (currentAuth, $scope) {
            var user = currentAuth.uid;

            $scope.createCourse = function (code, name, description) {
                var ref = firebase.database().ref().child('courses/' + code);
                ref.set({
                    id: code,
                    title: name,
                    description
                })
            };
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