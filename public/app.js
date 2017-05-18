console.log("Admin app app.js");

var app = angular.module('boardAdmin', []);

app.controller('mainController', ['$http', function($http){
  this.message = "angular works!";


}]);
