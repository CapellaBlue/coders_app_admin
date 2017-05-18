console.log("Admin app app.js");

var app = angular.module('boardAdmin', []);

app.controller('mainController', ['$http', function($http){
  //this.message = "angular works!";
  this.loggedIn = false;


  // GET All Posts
  this.getAllPosts = function(){
    this.loggedIn = true;
    $http({
        method: 'GET',
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        url: 'http://localhost:3000/posts'
    }).then(function(response){
        console.log(response.data);
        this.posts = response.data;
    }.bind(this));
  }

}]);
