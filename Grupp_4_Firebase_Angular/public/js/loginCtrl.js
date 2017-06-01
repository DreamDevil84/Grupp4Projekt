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
            $scope.email = 'student@edu.com';
            $scope.password = '123456';
            $scope.myLogin = function($scope){
                auth.$signInWithEmailAndPassword(email, password);
        };

        })
})();