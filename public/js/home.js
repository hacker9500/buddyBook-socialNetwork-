app.directive("contentFeed",function(){
  return {
    restrict: 'AE',
    templateUrl: "/js/templates/contentFeed.html",
    replace: false,
    scope:{
      feedObject: "=",
      likeIt: "&"
    },
    transclude: true
  };
});

app.controller("homeController",['$location','$scope','$http','friendWall',function ($location,$scope,$http,friendWall){
    console.log("home!!!");
    $scope.feeds = [];
    $http.get("/homeFeed").success(function(result){
	console.log(result);
	$scope.feeds = result;
    })
	.error(function(err,status){
	    console.log(err);
	    window.location.href = "http://hacktechpro.com";
	});
    
  $scope.likeIt = function(feed){
    feed.like += 1;
  };
  
}]);
