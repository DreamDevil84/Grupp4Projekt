(function () {
    angular.module('app')
        .controller('StudentCtrl', function (currentAuth, $firebaseObject, $firebaseArray, $scope, $location) {

            //referenser initieras
            var user = currentAuth.uid;
            var courseRef = firebase.database().ref().child('courses');
            var userCourseRef = firebase.database().ref().child('users/' + user + '/courses');
            var userRef = firebase.database().ref().child('users/' + user);
            var studentNewsRef = firebase.database().ref().child('news');
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
                            id: childDataSnap.key,
                            grade: childData.grade,
                            status: childData.status,
                            gradeWork: childData.gradeWork
                        };
                        studentCourses.push(childDetail);
                    });
                    //nyheter för studenten
                    $scope.studentNews = [];
                    studentNewsRef.once('value')
                        .then(function (types) {
                            types.forEach(function (data) {
                                if (data.key === 'general') {
                                    data.forEach(function (dates) {
                                        var datekey = dates.key;
                                        var news = dates.val();
                                        var theNews = {
                                            content: news.content,
                                            title: news.title,
                                            datekey: datekey,
                                            type: 'Alla',
                                            date: datekey.substring(0, 10),
                                            time: datekey.substring(11, 19)
                                        };
                                        $scope.studentNews.push(theNews);
                                    });
                                };
                                for (var x = 0; x < studentCourses.length; x++) {
                                    if (data.key === studentCourses[x].id) {
                                        data.forEach(function (dates) {
                                            var datekey = dates.key;
                                            var news = dates.val();
                                            var theNews = {
                                                content: news.content,
                                                title: news.title,
                                                datekey: datekey,
                                                type: data.key,
                                                date: datekey.substring(0, 10),
                                                time: datekey.substring(11, 19)
                                            };
                                            $scope.studentNews.push(theNews);
                                        });
                                    }
                                }
                                $scope.studentNews.sort(compare);
                            });
                            // console.log($scope.studentNews);
                        });
                    courseRef.once('value')
                        .then(function (data) {
                            data.forEach(function (childDataSnap) {
                                var childData = childDataSnap.val();
                                for (var x = 0; x < studentCourses.length; x++) {
                                    if (childDataSnap.key === studentCourses[x].id) {
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

        });
})();