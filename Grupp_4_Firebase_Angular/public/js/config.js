(function(){
    angular.module('app')
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
})();