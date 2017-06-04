(function () {
    angular.module('app')
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
            $scope.email = '';
            $scope.password = '';

            $scope.myLogin = function ($scope) {
                auth.$signInWithEmailAndPassword(email, password);
            }
            $('#wrongPassword').hide();

            $scope.closeLogin = function () {
                $('#wrongPassword').hide();
            };

            $scope.login = function (email, password) {
                firebase.auth().signInWithEmailAndPassword(email, password).then(function () {
                    $('#login').modal('hide');
                }).catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(error);
                    $('#wrongPassword').show();
                    // ...
                });
            }

        })
})();