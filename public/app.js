console.log("Admin app app.js");

var app = angular.module('boardAdmin', []);
var appURL= "https://typepolitik99.herokuapp.com/";
//var appURL = "http://localhost:3000/";

app.controller('mainController', ['$http', function($http){
  //this.message = "angular works!";
  this.loggedIn = false;
  this.returnedPosts = [];
  this.posts = [];
  this.filteredPosts = [];
  this.searchPost = {};
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
  this.editTopicMode = false;

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
        url : appURL+'posts'
    }).then(function(response){
        //console.log(response.data);
        for (var i = 0; i < response.data.length; i++) {
          var aff = response.data[i].political_affiliation;

          response.data[i].political_affiliation_c = this.assignPolAff(aff) ;
        }
        this.returnedPosts = response.data;
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
        url : appURL+'posts/'+post_id
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
    this.posts = this.returnedPosts;
    this.postFormData.likes = 0;
    this.postFormData.hardRightLikes = 0;
    this.postFormData.softRightLikes = 0;
    this.postFormData.centristLikes = 0;
    this.postFormData.softLeftLikes = 0;
    this.postFormData.hardLeftLikes = 0;
    this.postFormData.independentlikes = 0;
    console.log("inside createPost: ", this.postFormData);
    $http({
      method: 'POST',
      // url: 'http://localhost:3000/posts',
      url : appURL+'posts',
      data: this.postFormData
    }).then(function(result){
      console.log('Data from server: ', result.data);
      var aff = result.data.political_affiliation;
      result.data.political_affiliation_c = this.assignPolAff(aff) ;
      this.postFormData = {};
      this.posts.unshift(result.data);
    }.bind(this));
  }

  // Search posts
  this.searchPosts = function(){
    this.posts = this.returnedPosts;
    this.filteredPosts = this.posts;
    //console.log("Search Post: ", this.postFormData);
    if (this.postFormData.title != undefined) {
      this.filteredPosts = this.filteredPosts.filter(function(obj){
       return (obj.title.toLowerCase().includes(this.postFormData.title.toLowerCase())) ;
      }.bind(this));
    }
    //console.log(this.filteredPosts);
    if (this.postFormData.content != undefined){
      this.filteredPosts = this.filteredPosts.filter(function(obj){
        return obj.content.toLowerCase().includes(this.postFormData.content.toLowerCase());
      }.bind(this));
    }
    //console.log(this.filteredPosts);
    if (this.postFormData.author != undefined){
      this.filteredPosts = this.filteredPosts.filter(function(obj){
        return obj.author.toLowerCase().includes(this.postFormData.author.toLowerCase());
      }.bind(this));
    }
    //console.log(this.filteredPosts);
    if (this.postFormData.political_affiliation != undefined){
      this.filteredPosts = this.filteredPosts.filter(function(obj){
        return obj.political_affiliation == this.postFormData.political_affiliation;
      }.bind(this));
    }
    this.posts = this.filteredPosts;
    console.log(this.posts);
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
      url : appURL+'posts/'+tempId,
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
      url : appURL+'posts/'+tempId
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
      url : appURL+'comments/'+tempId
    }).then(function(){
      this.postComments.splice(ind,1);
    }.bind(this));
  }

  // Daily Topic page, show all daily topics
  this.toDailyTopic = function(){
    this.dailyTopicMode = true;
    this.viewOnePost = false;
    this.dailyTopicContent = {};
    this.editTopicMode = false;
    $http({
      method: 'GET',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      // url: 'http://localhost:3000/daily_topics'
      url : appURL+'daily_topics'
    }).then(function(response){
        console.log(response.data);
        this.dailyTopics = response.data;
    }.bind(this));
  }

  // create new daily topics
  this.createNewTopic = function(){
    console.log(this.dailyTopicContent);
    $http({
        method: 'POST',
        // url: 'http://localhost:3000/daily_topics',
        url : appURL+'daily_topics',
        data: this.dailyTopicContent
    }).then(function(result){
        console.log('Data from server: ', result.data);
        this.dailyTopicContent = {};
        this.dailyTopics.unshift(result.data);
    }.bind(this));
  };

  // delete a daily topic
  this.deleteDailyTopic = function(ind){
    var tempId = this.dailyTopics[ind].id;
    $http({
      method: 'DELETE',
      // url: 'http://localhost:3000/daily_topics/'+tempId
      url : appURL+'daily_topics/'+tempId
    }).then(function(){
      this.dailyTopics.splice(ind,1);
    }.bind(this));
  }

  // edit daily topic
  this.editDailyTopic = function(ind){
    this.editTopicMode = true;
    this.dailyTopicContent.content = this.dailyTopics[ind].content;
    this.currentTopicInd = ind;
  }

  // update daily topic in DB
  this.updateTopic = function(ind){
    var tempId = this.dailyTopics[ind].id;
    $http({
      method: 'PUT',
      // url: 'http://localhost:3000/posts/'+tempId,
      url : appURL+'daily_topics/'+tempId,
      data: this.dailyTopicContent
    }).then(function(result){
      this.editTopicMode = false;
      this.dailyTopicContent = {};
      this.dailyTopics.splice(ind, 1, result.data);
    }.bind(this));
  }

  // clear Topic input form
  this.clearTopicInput = function(){
    this.dailyTopicContent = {};
  }

  // Cancel Edit Daily Topic mode
  this.cancelEditTopic = function(){
    this.dailyTopicContent = {};
    this.editTopicMode = false;
  }

  // assign political affiliation color
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

  // View all Posts
  this.viewAllPosts = function(){
    this.posts = this.returnedPosts;
    this.filteredPosts = [];
    this.postFormData = {};
    this.postInd = -1;
    this.viewOnePost = false;
    this.currentPostInd = -1;
    this.editPostMode = false;
    this.dailyTopicMode = false
  }
  // Back to view posts
  this.backViewPosts = function(){
    // this.filteredPosts = [];
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
    this.returnedPosts = [];
    this.posts = [];
    this.filteredPosts = [];
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
    this.editTopicMode = false;

  }
}]);
