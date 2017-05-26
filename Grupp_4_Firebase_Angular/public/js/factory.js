(function(){
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
})();