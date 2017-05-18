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

            $scope.auth.$onAuthStateChanged(function (firebaseUser) {
                $scope.firebaseUser = firebaseUser;
                if ($scope.firebaseUser) {
                    var ref = firebase.database().ref().child('users/' + $scope.firebaseUser.uid);
                    console.log($scope.firebaseUser.uid);
                    var login = $firebaseObject(ref);
                    login.$loaded().then(function (user) {
                        console.log(user.type);
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

            //filtrera kurser för studenten
            var user = currentAuth.uid;
            var courseRef = firebase.database().ref().child('courses');
            var userRef = firebase.database().ref().child('users/' + user);
            var userCourseRef = firebase.database().ref().child('users/' + user + '/courses');

            $scope.studentCourses = [];
            $scope.studentGrades = [];
            $scope.userCourse = userCourseRef.once('value')
                .then(function (snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var childData = childSnapshot.val();
                        $scope.studentCourses.push(childData.id);
                    })
                });
            var courses = $firebaseArray(courseRef);
            var userCourses = $firebaseArray(userCourseRef);

            $scope.filterByStudent = function (course) {
                return ($scope.studentCourses.indexOf(course.id) !== -1);
            };
            $scope.courses = courses;
            $scope.courseRef = userCourseRef;
            $scope.userCourses = userCourses;
            $scope.user = $firebaseObject(userRef);


            $scope.gototest = function () {
                $location.path('/test');
            };


            //feedback funktioner

            //funktion för veckonummer, den finns ej i standard javascript så jag hittade en som funkar på stackoverflow
            Date.prototype.getWeek = function () {
                var onejan = new Date(this.getFullYear(), 0, 1);
                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
            }

            //ge feedback, 2 parametrar, första är värdet på rösten, andra är vilken typ, tex daglig eller veckans, text är för veckofeedback
            $scope.giveFeedback = function (reaction, type, text) {
                var date = new Date();
                text = 'tomt';
                var feedbackRef, feedbackRecordRef;
                if (type === 'daily') {
                    var today = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
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

            $scope.attendance = function () {
                var attendanceRef = firebase.database().ref().child('attendance/today/' + user);
                attendanceRef.once('value').then(function (attend) {
                    console.log(attend.val().status);
                    if (!attend.status.exists()) {
                        attendanceRef.set({
                            status: 'Present'
                        })
                    } else {
                        console.log(attend.val().status);
                        if (attend.val().status === 'Present') {
                            attendanceRef.update({
                                status: 'Late'
                            })
                        } else if (attend.val().status === 'Late') {
                            attendanceRef.update({
                                status: 'Absent'
                            })
                        } else if (attend.val().status === 'Absent') {
                            attendanceRef.update({
                                status: 'Present'
                            })
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
        .controller('TeacherCtrl', function (currentAuth) {

        })
        .controller('AdminCtrl', function (currentAuth) {

        });



}());