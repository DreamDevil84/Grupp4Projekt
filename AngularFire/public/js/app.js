(function () {



    angular.module('app', ['firebase'])

        .controller('MyCtrl', function ($scope, $firebaseObject, $firebaseArray, $firebaseAuth) {
            var ref = firebase.database().ref().child('data');
            var syncObject = $firebaseObject(ref);
            syncObject.$bindTo($scope, 'data');

            var msgRef = firebase.database().ref().child('messages');
            $scope.messages = $firebaseArray(msgRef);
            $scope.addMessage = function () {
                $scope.messages.$add({
                    text: $scope.newMessageText
                });
            };

            var auth = $firebaseAuth();


            // sign in
            $scope.signIn = function (email, password) {
                var email = $scope.signInEmail;
                var password = $scope.signInPassword;
                $scope.firebaseUser = null;
                $scope.error = null;

                auth.$signInWithEmailAndPassword(email, password).then(function (firebaseUser) {
                    $scope.firebaseUser = firebaseUser;
                })
                    .catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        $scope.error = error;
                    });
            };

            // sign up
            $scope.signUp = function (email, password) {
                var email = $scope.signUpEmail;
                var password = $scope.signUpPassword;
                $scope.firebaseUser = null;
                $scope.error = null;

                auth.$createUserWithEmailAndPassword(email, password).then(function (firebaseUser) {
                    $scope.firebaseUser = firebaseUser;
                })
                    .catch(function (error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        $scope.error = error;
                    });
            };

            // reset password
            $scope.resetPassword = function (email) {

                var emailAddress = $scope.signInEmail;

                auth.$sendPasswordResetEmail(emailAddress).then(function () {
                    console.log("A password-reset email has been sent to your mail address: " + emailAddress)
                }, function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorMessage + errorCode)
                });
            };

            // login status check
            auth.$onAuthStateChanged(function (firebaseUser) {
                if (firebaseUser) {
                    console.log("Signed in as:", firebaseUser.uid);
                    $location.path('statefiles/student')
                } else {
                    console.log("Signed out");
                }
            });

            // log out
            $scope.logOut = function () {
                auth.$signOut().then(function () {
                    console.log("Logged out successfully!")
                }).catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorMessage + errorCode)
                });
            };

        });

           /*// states
            app.config(function ($routeProvider) {
                $routeProvider
                  .when("/", {
                     templateUrl: "statefiles/student.htm"
                 })
               .when("/london", {
                     templateUrl: "london.htm"
                 })
              .when("/paris", {
                     templateUrl: "paris.htm"
                 });
         });
*/



}());