app.controller("wallController",["friendWall",'$scope','$http',function(friendWall,$scope,$http){
    console.log("wall!!");
    $scope.present = friendWall.present;
  $scope.likeIt = function(feed){
      //feed.like += 1;
      $http.post("/likeFeed",{personID: feed.personID, _id: feed._id})
	  .success(function(result){
	      feed.like +=1;
	  })
	  .error(function(err,status){
	      console.log("error");
	  });
  };
    
  $scope.postTheFeed = function(feed){
      $http.post("/wallFeed",{text: feed, like: 0})
	  .success(function(result){
	      console.log(result);
	      console.log("hello");
              $scope.myfeeds.splice(0,0,result);
	  })
	  .error(function(err,status){
	      console.error(err);
	  });
    $scope.postFeed = "";
  };
    
    $scope.myfeeds = [];
    if($scope.present == false)
	$http.get("/wallFeed")
	.success(function(result){
	    $scope.myfeeds = result;
	    console.log(result);
	})
	.error(function(err,status){
	    window.location.href = "http://hacktechpro.com";
	});
    else
	$scope.myfeeds = friendWall.result;
}]);
