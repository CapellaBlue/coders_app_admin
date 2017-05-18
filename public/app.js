console.log("Admin app app.js");

var app = angular.module('boardAdmin', []);

app.controller('mainController', ['$http', function($http){
  //this.message = "angular works!";
  this.loggedIn = false;
  this.posts = [];
  this.postFormData = {};
  this.postInd = -1;
  this.viewOnePost = false;
  this.currentPostInd = -1;
  this.viewPost = {}
  this.postComments = [];
  this.editPostMode = false;

  // GET All Posts
  this.getAllPosts = function(){
    this.loggedIn = true;
    this.viewOnePost = false;
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

  // See one Post and its Comments
  this.showPostComments = function(post_id, ind){
    this.viewPost = this.posts[ind];
    $http({
        method: 'GET',
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        url: 'http://localhost:3000/posts/'+post_id
    }).then(function(response){
      console.log(response.data.comments);
      this.postComments = response.data.comments;
      this.viewOnePost = true;
      this.currentPostInd = ind;
    }.bind(this));
  };

  // Create A Post
  this.createPost = function(){
    console.log("inside createPost: ", this.postFormData);
    $http({
      method: 'POST',
      url: 'http://localhost:3000/posts',
      data: this.postFormData
    }).then(function(result){
      console.log('Data from server: ', result.data);
      this.postFormData = {};
      this.posts.unshift(result.data);
    }.bind(this));
  };

  // Edit Post mode
  this.editPost = function(ind){
    this.editPostMode = true;
    this.postFormData.title = this.posts[ind].title;
    this.postFormData.content = this.posts[ind].content;
    this.postFormData.author = this.posts[ind].author;
    this.postInd = ind;
  }

  // Cancel Edit Post
  this.cancelEditPost = function(){
    this.editPostMode = false;
    this.postFormData = {};
  }

  // Update Post in DB
  this.updatePost = function(ind){
    var tempId = this.posts[ind].id;
    console.log("inside Update Post: ", this.postFormData);
    $http({
      method: 'PUT',
      url: 'http://localhost:3000/posts/'+tempId,
      data: this.postFormData
    }).then(function(result){
      console.log('Post updated from server: ', result.data);
      this.editPostMode = false;
      this.postFormData = {};
      this.posts.splice(ind, 1, result.data);
    }.bind(this));
  }

  // Delete a post and all its Comments
  this.deletePost = function(ind){
    var tempId = this.posts[ind].id;
    $http({
      method: 'DELETE',
      url: 'http://localhost:3000/posts/'+tempId
    }).then(function(){
      this.posts.splice(ind,1);
      this.viewAllPosts();
    }.bind(this));
  };

  // Delete a Comment in a post
  this.deleteComment = function(ind){
    var tempId = this.postComments[ind].id;
    $http({
      method: 'DELETE',
      url: 'http://localhost:3000/comments/'+tempId
    }).then(function(){
      this.postComments.splice(ind,1);
    }.bind(this));
  }

  // Back to view all posts
  this.viewAllPosts = function(){
    this.postFormData = {};
    this.postInd = -1;
    this.viewOnePost = false;
    this.currentPostInd = -1;
    this.editPostMode = false;
  }

  // Fake Log off
  this.logOff = function(){
    this.loggedIn = false;
    this.posts = [];
  }
}]);
