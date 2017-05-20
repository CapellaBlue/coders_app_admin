console.log("Admin app app.js");

var app = angular.module('boardAdmin', []);
var herokuURL= "https://typepolitik99.herokuapp.com/";
var localURL = "http://localhost:3000/";

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
  this.dailyTopicMode = false
  this.dailyTopics = [];
  this.dailyTopicContent = {};
  this.affiliation = ["Hard Right", "Soft Right", "Centrist", "Soft Left", "Hard Left", "Independent"];

  // GET All Posts
  this.getAllPosts = function(){
    this.loggedIn = true;
    this.viewOnePost = false;
    $http({
        method: 'GET',
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        // url: 'http://localhost:3000/posts'
        url : herokuURL+'posts'
    }).then(function(response){
        //console.log(response.data);
        for (var i = 0; i < response.data.length; i++) {
          var aff = response.data[i].political_affiliation;

          response.data[i].political_affiliation_c = this.assignPolAff(aff) ;
        }
        this.posts = response.data;
        console.log("All posts: ",this.posts);
    }.bind(this));
  }

  // See one Post and its Comments
  this.showPostComments = function(post_id, ind){
    this.viewPost = this.posts[ind];
    console.log("View Post: ", this.viewPost);
    $http({
        method: 'GET',
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        // url: 'http://localhost:3000/posts/'+post_id
        url : herokuURL+'posts/'+post_id
    }).then(function(response){
      console.log("View Post Comments: ",response.data.comments);
      for (var i = 0; i < response.data.comments.length; i++) {
        var aff = response.data.comments[i].political_affiliation;
        response.data.comments[i].political_affiliation_c = this.assignPolAff(aff) ;
      }
      this.postComments = response.data.comments;
      this.viewOnePost = true;
      this.currentPostInd = ind;
    }.bind(this));
  }

  // Create A Post
  this.createPost = function(){
    console.log("inside createPost: ", this.postFormData);
    $http({
      method: 'POST',
      // url: 'http://localhost:3000/posts',
      url : herokuURL+'posts',
      data: this.postFormData
    }).then(function(result){
      console.log('Data from server: ', result.data);
      var aff = result.data.political_affiliation;
      result.data.political_affiliation_c = this.assignPolAff(aff) ;
      this.postFormData = {};
      this.posts.unshift(result.data);
    }.bind(this));
  }

  // Edit Post mode
  this.editPost = function(ind){
    this.editPostMode = true;
    this.postFormData.title = this.posts[ind].title;
    this.postFormData.content = this.posts[ind].content;
    this.postFormData.author = this.posts[ind].author;
    this.postFormData.political_affiliation = this.posts[ind].political_affiliation
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
      // url: 'http://localhost:3000/posts/'+tempId,
      url : herokuURL+'posts/'+tempId,
      data: this.postFormData
    }).then(function(result){
      console.log('Post updated from server: ', result.data);
      var aff = result.data.political_affiliation;
      result.data.political_affiliation_c = this.assignPolAff(aff) ;
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
      // url: 'http://localhost:3000/posts/'+tempId
      url : herokuURL+'posts/'+tempId
    }).then(function(){
      this.posts.splice(ind,1);
      this.viewAllPosts();
    }.bind(this));
  }

  // Delete a Comment in a post
  this.deleteComment = function(ind){
    var tempId = this.postComments[ind].id;
    $http({
      method: 'DELETE',
      // url: 'http://localhost:3000/comments/'+tempId
      url : herokuURL+'comments/'+tempId
    }).then(function(){
      this.postComments.splice(ind,1);
    }.bind(this));
  }

  this.toDailyTopic = function(){
    this.dailyTopicMode = true;
    this.viewOnePost = false;
    $http({
      method: 'GET',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      // url: 'http://localhost:3000/daily_topics'
      url : herokuURL+'daily_topics'
    }).then(function(response){
        console.log(response.data);
        this.dailyTopics = response.data;
    }.bind(this));

    this.createNewTopic = function(){
      console.log(this.dailyTopicContent);
      $http({
        method: 'POST',
        // url: 'http://localhost:3000/daily_topics',
        url : herokuURL+'daily_topics',
        data: this.dailyTopicContent
      }).then(function(result){
        console.log('Data from server: ', result.data);
        this.dailyTopicContent = {};
        this.dailyTopics.unshift(result.data);
      }.bind(this));
    };

  }

  this.assignPolAff = function(aff){
    if(aff == "Hard Right"){
      return "hard-right";
    } else if(aff == "Soft Right"){
      return "soft-right";
    } else if(aff == "Hard Left"){
      return "hard-left";
    } else if(aff == "Soft Left"){
      return "soft-left";
    } else if(aff == "Centrist"){
      return "centrist";
    } else if(aff == "Independent"){
      return "independent";
    };
  }

  // Back to view all posts
  this.viewAllPosts = function(){
    this.postFormData = {};
    this.postInd = -1;
    this.viewOnePost = false;
    this.currentPostInd = -1;
    this.editPostMode = false;
    this.dailyTopicMode = false
  }

  // Fake Log off
  this.logOff = function(){
    this.loggedIn = false;
    this.postFormData = {};
    this.postInd = -1;
    this.viewOnePost = false;
    this.currentPostInd = -1;
    this.viewPost = {}
    this.postComments = [];
    this.editPostMode = false;
    this.dailyTopicMode = false
    this.dailyTopics = [];
    this.dailyTopicContent = {};
  }
}]);
