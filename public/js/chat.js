app.directive("friendList",function(){
  return {
    restrict: 'AE',
    templateUrl: "/js/templates/friendList.html",
    transclude: false,
    scope: {
      friendObject : "=",
    }
  };
});

app.directive("friendListChat",function(){
    return {
        restrict: 'AE',
        templateUrl: "/js/templates/friendListChat.html",
        transclude: false,
        scope: {
            friendObject : "=",
	    loadFriend: "&"
        }
    };
});

app.directive("message",function(){
  return {
    restrict: 'AE',
    templateUrl: "/js/templates/message.html",
    scope: {
	messageObject: "=",
	loadMssg: "&"
    },
    trandclude: false
  };
});

console.log("hello");

app.controller("chat",['$scope','$http',function($scope,$http){
  console.log("chat!!!");
    $scope.messages = [];
    $scope.friends = [];
    $scope.socket = io();
    $scope.currentf = null;
    $http.get("/getFriends")
	.success(function (result){
	    //console.log(result);
	    $scope.friends = result;
	})
	.error(function (err,status){});
    $scope.loadM = function (message){
	console.log(message);
    };3
  $scope.postMessage = function(message){
      $scope.socket.emit("message",{
	  text: message
      });
    $scope.message = "";
  };
    
    $scope.openFriend = function(friend){
	$scope.messages = [];
	$scope.currf =friend;
	$scope.socket.emit("join",{ room: friend.chatId});
    };
    
    $scope.socket.on("message",function (message){
	console.log(message);
	//document.gerElementById("chatB");
	$scope.messages.splice(0,0,message);
    });
}]);
