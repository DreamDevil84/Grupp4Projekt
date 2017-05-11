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
        .controller('LoginCtrl', function ($scope, Auth, $location) {
            $scope.auth = Auth;

            $scope.auth.$onAuthStateChanged(function (firebaseUser) {
                $scope.firebaseUser = firebaseUser;
                if($scope.firebaseUser === null)
                {
                    $location.path('/home');
                }
                else
                {
                    $location.path('/admin');
                }
            });
            $scope.email = 'daniel.edstrom1984@hotmail.com';
            $scope.password = 'newton123';

        })
        //denna function är till för att se om användaren inte är autensierad och blir då sparkad till förstasidan
        .run(function ($rootScope, $location) {
            $rootScope.$on('$routeChangeError', function (event, next, previous, error) {
                if (error === 'AUTH_REQUIRED') {
                    $location.path('/home');
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
                });
        })
        .controller('HomeCtrl', function (currentAuth) {

        })
        .controller('AdminCtrl', function (currentAuth) {

        });




    // .directive('startContent', function(){
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'views/home/home.html'
    //     };
    // })
    // .directive('adminContent', function(){
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'views/admin/home.html'
    //     };
    // })
    // .directive('teacherContent', function(){
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'views/teacher/home.html'
    //     };
    // })
    // .directive('studentContent', function(){
    //     return {
    //         restrict: 'E',
    //         templateUrl: 'views/student/home.html'
    //     };
    // });



    // var auth = $firebaseAuth();
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



}());