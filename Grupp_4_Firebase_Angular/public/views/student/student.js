angular.module("app", ['firebase', 'ngRoute'])
    .controller('StudentCtrl', function (currentAuth, $firebaseObject, $firebaseArray, $scope) {

        var user = currentAuth.uid;
        var courseRef = firebase.database().ref().child('courses');
        var userRef = firebase.database().ref().child('users/' + user);
        var userCourseRef = firebase.database().ref().child('users/' + user + '/courses');


        $scope.studentCourses = [];
        $scope.studentGrades = [];
        $scope.userCourse = userCourseRef.once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    // var key = childSnapshot.key;
                    var childData = childSnapshot.val();
                    $scope.studentCourses.push(childData.id);
                    // console.log(childData.id);
                })
            });
        var courses = $firebaseArray(courseRef);
        var userCourses = $firebaseArray(userCourseRef);

        $scope.testval = 'test1';


        $scope.filterByStudent = function (course) {
            return ($scope.studentCourses.indexOf(course.id) !== -1);
        };
        $scope.courses = courses;
        $scope.courseRef = userCourseRef;
        $scope.userCourses = userCourses;

        $scope.user = $firebaseObject(userRef);


        //feedback funktion
        var feedbackRef = firebase.database().ref().child('feedback/daily/today');
        // var feedbackRecord = firebase.database().ref().child('feedback/daily/today/hasVoted');
        // var record = $firebaseArray(feedbackRecord);
        // $scope.feedback = $firebaseArray(feedbackRef); //Kanske inte behöver
        $scope.giveFeedback = function (reaction) {
            var storedLikes = null;
            var storedVotes = null;
            feedbackRef.once('value').then(function (snapshot) {
                var storedLikes = snapshot.val().likes;
                storedLikes = storedLikes + reaction;
                var storedVotes = snapshot.val().votes;
                storedVotes++;
                feedbackRef.set({
                    likes: storedLikes,
                    votes: storedVotes
                });
            })
            var fdback = {
                hasVoted: {
                    user: user,
                    theirVote: reaction
                }
            };
            feedbackRef.push(fdback);
        };



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

    });