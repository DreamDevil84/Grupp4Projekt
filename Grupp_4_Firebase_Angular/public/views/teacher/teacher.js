(function () {
    angular.module('app')
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

            //lärarens nyheter

            var teacherNewsRef = firebase.database().ref().child('news');

            $scope.teacherNews = [];

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
            });
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



        });
})();