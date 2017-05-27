(function () {
        angular.module('app')
                .controller('AdminCtrl', function (currentAuth, $scope, $firebaseObject, $firebaseArray) {
                        var user = currentAuth.uid;
                        var userRef = firebase.database().ref().child('users/' + user);
                        $scope.user = $firebaseObject(userRef);

                        //skaffar dagens datum, används för andra funktioner
                        var date = new Date();
                        var today = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
                        var time = function () {
                                var date = new Date();
                                return ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2) + ':' + ('00' + date.getSeconds()).slice(-2);
                        }

                        //funktion för veckonummer, den finns ej i standard javascript så jag hittade en som funkar på stackoverflow
                        Date.prototype.getWeek = function () {
                                var onejan = new Date(this.getFullYear(), 0, 1);
                                return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
                        };

                        //adminTabbar
                        $scope.adminTab = 'news';
                        $scope.setAdminTab = function (tab) {
                                $scope.adminTab = tab;
                        };

                        //admin nyheter
                        $scope.adminNewsTab = 'read';
                        $scope.setAdminNewsTab = function (tab) {
                                $scope.adminNewsTab = tab;
                        };
                        var newsRef = firebase.database().ref().child('news');
                        var regNewsRef = newsRef.child('general');
                        var adminNewsRef = newsRef.child('adminsOnly');

                        $scope.newsIndex = 0;

                        $scope.allNews = [];
                        newsRef.once('value').then(function (data) {
                                data.forEach(function (forWho) {
                                        var who = forWho.key;
                                        forWho.forEach(function (dates) {
                                                var datekey = dates.key;
                                                var news = dates.val();
                                                var date = datekey.substring(0, 10);
                                                var time = datekey.substring(11, 19);
                                                var newsItem = {
                                                        title: news.title,
                                                        content: news.content,
                                                        forWho: who,
                                                        datekey: datekey,
                                                        date: date,
                                                        time: time
                                                };
                                                $scope.allNews.push(newsItem);
                                        });
                                        $scope.allNews.sort(compare);
                                });
                        });

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

                        $scope.moreNews = function () {
                                $scope.newsIndex = $scope.newsIndex + 2;
                        }

                        $scope.newsType = 'general';
                        $scope.newsTypeName = 'Nyhetstyp';
                        $scope.setNewsType = function (type, name) {
                                $scope.newsType = type;
                                $scope.newsTypeName = name;
                        };

                        $scope.createNews = function (news, title, type) {
                                var ref = firebase.database().ref().child('news/' + type + '/' + today + '_' + time());
                                ref.set({
                                        content: news,
                                        title: title
                                });
                        };


                        //admin kurser
                        $scope.createCourse = function (code, name, description) {
                                var ref = firebase.database().ref().child('courses/' + code);
                                ref.set({
                                        id: code,
                                        title: name,
                                        description
                                })
                        };

                        //admin användare
                        $scope.createUser = function (fname, lname, email, password, type) {
                                var config = {
                                        apiKey: "AIzaSyB3UdUl1As-W_3gHCf-aDadJw0myIOvdR8",
                                        authDomain: "schoolweb-35754.firebaseapp.com",
                                        databaseURL: "https://schoolweb-35754.firebaseio.com"
                                };
                                var secondaryApp = firebase.initializeApp(config, "Secondary");
                                secondaryApp.auth().createUserWithEmailAndPassword(email, password).then(function (firebaseUser) {
                                        var ref = firebase.database().ref().child('users/' + firebaseUser.uid);
                                        ref.set({
                                                email: email,
                                                firstName: fname,
                                                lastName: lname,
                                                type: type
                                        });
                                        console.log("User " + firebaseUser.uid + " created successfully!");
                                        secondaryApp.auth().signOut();
                                });
                        };

                        //skapa veckofeedback
                        var weekFeedbackRef = firebase.database().ref().child('feedback/weekly/' + date.getWeek() + '/form');
                        $scope.weekFeedbackType = 'Svarsalternativ';
                        $scope.setWeeklyFeedbackAnswerType = function (type) {
                                $scope.weekFeedbackType = type;
                        };
                        $scope.weeklyFeedbackForm = $firebaseArray(weekFeedbackRef);
                        $scope.addWeeklyFeedbackQuestion = function (text, type) {
                                if (type != 'Svarsalternativ') {
                                        weekFeedbackRef.push({
                                                question: text,
                                                type: type
                                        });
                                };
                        };
                });
})();