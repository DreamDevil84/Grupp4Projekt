(function(){
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
})();