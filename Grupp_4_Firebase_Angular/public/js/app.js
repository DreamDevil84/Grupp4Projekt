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
        .module('app', ['firebase'])
        .factory('Auth', function($firebaseAuth){
            return $firebaseAuth();
        })
        .controller('MyCtrl', function ($scope, Auth, $firebaseObject, $firebaseArray, $firebaseAuth) {
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

            $scope.auth = Auth;

            $scope.auth.$onAuthStateChanged(function(firebaseUser){
                $scope.firebaseUser = firebaseUser;
            });

            // var auth = $firebaseAuth();

             $scope.email = 'daniel.edstrom1984@hotmail.com';
             $scope.password = 'newton123';

            // $scope.signIn = function (email, password) {
            //     $scope.firebaseUser = null;
            //     $scope.error = null;

            //     auth.$signInWithEmailAndPassword(email, password).then(function (firebaseUser) {
            //         $scope.firebaseUser = firebaseUser;
            //     })
            //         .catch(function (error) {
            //             var errorCode = error.code;
            //             var errorMessage = error.message;
            //             $scope.error = error;
            //         });
            // };
        });


}());