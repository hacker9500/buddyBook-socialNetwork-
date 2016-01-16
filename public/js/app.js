console.log("ok");

var app = angular.module('dashBoard',['ngRoute']);

app.config(function($routeProvider){
  $routeProvider
  .when('/',{
    templateUrl: "/js/templates/home.html",
    controller: "homeController"
  })
  .when('/wall',{
    templateUrl: "/js/templates/wall.html",
    controller: "wallController"
  })
  .when('/chat',{
    templateUrl: "/js/templates/chat.html",
    controller: "chat"
  })
  .otherwise({
    redirectTo: "/"
  });
});


app.directive("friendListSearch",function(){
    return {
	restrict : "AE",
	templateUrl: "/js/templates/friendList.html",
	transclude: false,
	scope: {
	    friendObject: "=",
	    friendWall : "&"
	}
    };
});

app.service("friendListData",function(){
    this.list = [];
    var self = this;
    this.prn = function(){
	console.log(self.list);
    };
});

app.service("friendWall",['$location',function($location){
    this.present = false;
    this.result = [];
}]);

app.controller("navigator",["friendWall",'$scope','$location','$http','friendListData',function(friendWall, $scope,$location,$http,friendListData){
    $scope.homeOn = false;
    $scope.home = function(){
	$scope.homeOn = true;
	$location.path("/home");
    };
    if($location.url() == "/")
	$scope.homeOn = true;
    $scope.wall = function(){
	friendWall.present = false;
	friendWall.result = [];
	console.log("wall");
	$scope.homeOn = false;
	window.location.href = "http://hacktechpro.com/home#/wall";
  };
    $scope.chat = function(){
	$scope.homeOn = false;
    $location.path("/chat");
  };
  $scope.logout = function(){
    console.log("log out");
    $http.post("/logout")
    .success(function(result){
	window.location.href = "http://hacktechpro.com";
    })
	  .error(function(data,status){
      console.log(status);
    });
  };
    $scope.friends = [];
    $scope.$watch('search',function(newValue,oldValue){
	$http.post("/friendList",{name: newValue})
	    .success(function(result){
		$scope.friends = result
		//console.log($scope.friends);
		//console.log(result);
	    })
	    .error(function(err,status){});
    });
    $scope.getWall = function(friend){
	$http.post("/friendFeed",{name: friend.name})
	    .success(function (result){
		$scope.search = "";
		console.log(result);
		friendWall.present = true;
		friendWall.result = result;
		$location.path("/wall");
	    })
	    .error(function (err,status){});
    };
}]);


