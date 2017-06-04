(function () {
    angular.module('app')
        .factory('Auth', function ($firebaseAuth) {
            return $firebaseAuth();
        })
        .factory('AttendanceList', function ($firebaseObject) {

            return function (today, student) {
                // create a reference to the database node where we will store our data
                var ref = firebase.database().ref().child('attendance/' + today + '/' + student);
                // return it as a synchronized object
                return $firebaseObject(ref);
            }
        })
        .factory('DailyFeedbackList', function ($firebaseObject) {

            return function (date) {
                // create a reference to the database node where we will store our data
                var ref = firebase.database().ref().child('feedback/daily/' + date);
                // return it as a synchronized object
                return $firebaseObject(ref);
            }
        })
        .factory('ScheduleTimes', function () {

            return [
                {
                    time: '9:00',
                    index: 0
                },
                {
                    time: '9:30',
                    index: 1
                },
                {
                    time: '10:00',
                    index: 2
                },
                {
                    time: '10:30',
                    index: 3
                },
                {
                    time: '11:00',
                    index: 4
                },
                {
                    time: '11:30',
                    index: 5
                },
                {
                    time: '12:00',
                    index: 6
                },
                {
                    time: '12:30',
                    index: 7
                },
                {
                    time: '13:00',
                    index: 8
                },
                {
                    time: '13:30',
                    index: 9
                },
                {
                    time: '14:00',
                    index: 10
                },
                {
                    time: '14:30',
                    index: 11
                },
                {
                    time: '15:00',
                    index: 12
                },
                {
                    time: '15:30',
                    index: 13
                },
                {
                    time: '16:00',
                    index: 14
                }
            ];
        })
})();