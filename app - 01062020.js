//(function() {
  //var amsApp = angular.module('AMSApp', ['ui.router', 'angularUtils.directives.dirPagination','angular-loading-bar','ngAnimate']);
  var amsApp = angular.module('AMSApp', ['ui.router']);
  
  amsApp.config(['$stateProvider', '$urlRouterProvider', 
  function($stateProvider, $urlRouterProvider, $rootScope, $locationProvider) {
    $stateProvider
      .state('login', {
        url : '/login',
        templateUrl : 'login.html',
        controller : 'LoginController'
      })
	  .state('home', {
        url : '/home',
        templateUrl : 'home.html',
        controller : 'homeController'
      })
	  .state('configuration', {
        url : '/configuration',
        templateUrl : 'configuration.html',
        controller : 'ConfigurationController'
      })
	  .state('standalone', {
        url : '/standalone',
        templateUrl : 'standalone.html',
        controller : 'standaloneController'
      })
	  .state('welcomescr', {
        url : '/welcomescr',
        templateUrl : 'welcome.html',
		controller : 'welcomeController'
        
      })
	  .state('selfhelp', {
        url : '/selfhelp',
        templateUrl : 'selfhelp.html',
        controller : 'shelpCtrl'
      });
	  
	  $urlRouterProvider.otherwise('/welcomescr');
	}]);

amsApp.controller('standaloneController', function($scope,$state, $stateParams, $rootScope, $sce, $http) {
	
	$scope.moveToDashboard = function(){
	
		if($rootScope.loginSuccess){
			
			$state.go('home');
			
		}else{
			$state.go("login");
		}
	}
	
	$scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
	
});	
amsApp.controller('welcomeController', function($scope,$state, $stateParams, $rootScope, $sce, $http) {
	
	$rootScope.welcomeScr = false;
	$scope.proceedToLogin = function(){
		$rootScope.welcomeScr = true;
		$state.go('login');
	}
  
	
});	
amsApp.controller('shelpCtrl', function($scope,$state, $stateParams, $rootScope, $sce, $http) {

	//$scope.SelfHelpURL = 'http://app2900.gha.kfplc.com:9040/application/get';
	/*$scope.SelfHelpURL = 'shData.json';
	$http.get($scope.SelfHelpURL)
        .then(function successCallback(response) {
			$scope.selfHelpData = response.data;*/
			/*for(var i=0,j=0; i< $scope.allConfigs.length;i++){
           
				if($scope.allConfigs[i].name === 'Self_Help_Portal'){
				   
				   for(var k=0; k<$scope.allConfigs[i].modules.length; k++){
					$scope.selfhelpModule[j] = angular.copy($scope.allConfigs[i].modules[k]);
					j++;}
					
				}
			}*/
			//$scope.selfhelpModule = $scope.selfhelpModule['0'];
			for (var i=0; i< $rootScope.selfHelpData.modules.length;i++){
				$rootScope.selfHelpData.modules[i].expanded = false;
			}
		
			       /* },function errorCallback(data) {
            console.log(data);
			
        });*/
			
	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	}
	$scope.expandModule = function(idx){
		$rootScope.selfHelpData.modules[idx].expanded = !$rootScope.selfHelpData.modules[idx].expanded;
		for (var i=0; i< $rootScope.selfHelpData.modules.length;i++){
			if(i !== idx){
				$rootScope.selfHelpData.modules[i].expanded = false;
			}
		}
	}
	$scope.dispTheiFrame = false;
	$scope.iframeUrl ="";
	$scope.dispiFrame = function(url){
		
		$scope.dispTheiFrame = true;
		$scope.iframeUrl = url;
		//$scope.iframeUrl = 'http://app2900.gha.kfplc.com:9080/RefApp/';
		//$scope.iframeUrl = 'http://app2900.gha.kfplc.com:9080/IDOCTable/';
		
	};
	// $scope.openApp = function (id) {
		// //$scope.setAllToDefault();
		// for (var i = 0; i < $scope.allApplications.length; i++) {
			// $scope.allApplications[i].expandable = false;
			// if (i == id) {
				// $scope.allApplications[id].expandable = true;
			// }
		// }
	// };
	
	$scope.moveToDashboard = function(){
	
		if($rootScope.loginSuccess){
			
			$state.go('home');
			
		}else{
			$state.go("login");
		}
	}
	
	$scope.logout = function(){
		$rootScope.loginSuccess = false;
		$rootScope.currentUser = {};
		$state.go("login");
	}
	
});
amsApp.controller('ConfigurationController', function($scope,$location, $anchorScroll,$http, $state, $stateParams, $rootScope) {

	$scope.buttonName = '';
	$scope.temp = {
		appName:'', modName:'',topicName:'' ,topicUrl:'',topicRoles:[]
	};

	$scope.allApplications = ['First App','Second App','Third App','Forth App','Fifth App','Sixth App'];
	$scope.config={};
	$scope.rolesList=[{roleName:'ADMIN'},{roleName:'Business_User'},{roleName:'Support_Analyst'}];
	$scope.selectedIndex = 0;
	
	$scope.allConfigs = [];
	$scope.edit = false;
	$scope.error = false;
	$scope.incomplete = false;
	$scope.hideform = true;
	$scope.configs = [];
	$scope.getApplicationDataUrl = "http://app2900.gha.kfplc.com:9040/application/get";
	$scope.postApplicationDataUrl = "http://app2900.gha.kfplc.com:9040/topic/add";
	
	

	$scope.getAppData = function() {
		$scope.tmp = {};
		$scope.allConfigs = [];
		
		$http.get($scope.getApplicationDataUrl)
			.then(function successCallback(response) {
				$scope.allConfigs = response.data;
				console.log($scope.allConfigs);
				$scope.convertJson();
			},function errorCallback(data) {
				console.log(data);
			});
	};
	
	$scope.convertJson = function() {
		$scope.tmp = {};	
		$scope.configs = [];
		var tmpidx=0;
		console.log($scope.allConfigs);
		for (var i=0;i<$scope.allConfigs.length;i++){
			for (var j=0;j<$scope.allConfigs[i].modules.length; j++){
				for (var k=0;k<$scope.allConfigs[i].modules[j].topics.length;k++){
					$scope.tmp.appName = $scope.allConfigs[i].name;
					$scope.tmp.modName = $scope.allConfigs[i].modules[j].name;
					$scope.tmp.topicName = $scope.allConfigs[i].modules[j].topics[k].name;
					$scope.tmp.topicUrl = $scope.allConfigs[i].modules[j].topics[k].url;
					$scope.tmp.topicRoles = $scope.allConfigs[i].modules[j].topics[k].roles;
					//$scope.configs.push(tmp);
					$scope.configs[tmpidx] = angular.copy($scope.tmp);
					//console.log($scope.tmp);
					tmpidx++;
					
				}
			}
			
		}
		/*  $scope.selfhelpModule = [];
		for(var i=0,j=0; i< $scope.allConfigs.length;i++){
			
			if($scope.allConfigs[i].name === 'Self_Help_Portal'){
				
				for(var k=0; k<$scope.allConfigs[i].modules.length; k++){
				$scope.selfhelpModule[j] = angular.copy($scope.allConfigs[i].modules[k]);
				j++;}
			}
		} */
		//console.log('selfhelp data');
		//console.log($scope.selfhelpModule); 
		//console.log($scope.configs);
		//console.log($scope.getuniqueValues($scope.selfhelpModule, "name"));
	 
	};
	
	$scope.getuniqueValues = function(collection, keyname) {
		// we define our output and keys array;
			var output = [],
			  keys = [];

			// we utilize angular's foreach function
			// this takes in our original collection and an iterator function
			angular.forEach(collection, function(item) {
			  // we check to see whether our object exists
			  var key = item[keyname];
			  // if it's not already part of our keys array
			  if (keys.indexOf(key) === -1) {
				// add it to our keys array
				keys.push(key);
				// push this item to our final output array
				output.push(item);
			  }
			});
			// return our array which should be devoid of
			// any duplicates
			return output;
	}; 
	$scope.getAppData();
	$scope.editConfig = function(idx) {
	  $scope.config={};
	  $scope.hideform = false;
	  $scope.edit = true;
	  if (idx == 'new') {
		$scope.editFormHeader = 'Create new Config';
		$scope.incomplete = true;
		/*$scope.fName = '';
		$scope.lName = '';*/
		$scope.config= angular.copy($scope.temp);
		console.log($scope.config);
		console.log($scope.temp);
		$scope.buttonName = 'SAVE';
		} else {
		
		$scope.editFormHeader = 'Edit selected Config';
		$scope.config = angular.copy($scope.configs[idx]);
		console.log($scope.config);
		$scope.buttonName = 'UPDATE'; 
		$scope.selectedIndex = idx;
	  }
	   $location.hash('bottomSection');
	   //scroll to bottom for ease of user
	   $anchorScroll();
	};
	$scope.saveOrUpdateData = function(){
		$scope.tmp={};
		if($scope.buttonName == 'SAVE'){
			//$scope.config.id=$scope.currentConfigs.length + 1;
			console.log($scope.config);
			$scope.tmp.name = $scope.config.topicName;
			$scope.tmp.url = $scope.config.topicUrl;
			var tmpTopicRoles = [];
			console.log($scope.config.topicRoles);
			for(var i=0; i< $scope.config.topicRoles.length; i++){
				var tmpTopicRole={};
				tmpTopicRole.name = $scope.config.topicRoles[i];
				tmpTopicRoles.push(tmpTopicRole);
			}
			$scope.tmp.roles = tmpTopicRoles;
			var tmpModule = {};
			var tmoAppName = {};
			tmpModule.name = $scope.config.modName;
			tmoAppName.name = $scope.config.appName;
			tmpModule.application = tmoAppName;
			$scope.tmp.module = tmpModule;
			//$scope.configs.push($scope.config);
			console.log($scope.configs);
			console.log($scope.tmp);
			$http.post($scope.postApplicationDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for Posting data");
				$scope.getAppData();
			},function errorCallback(data) {
				console.log("Error in Posting data");
			});
			$scope.hideform = true;
		}
		if($scope.buttonName == 'UPDATE'){
			$scope.configs[$scope.selectedIndex]= angular.copy($scope.config);
			console.log($scope.configs);
			$scope.hideform = true;
		}
		$location.hash('topSection');
		//scroll to Page Top for ease of user
		$anchorScroll();
		
	}
	
	$scope.resetForm = function(){
		$scope.hideform = true;
		$location.hash('topSection');
		//scroll to Page Top for ease of user
		$anchorScroll();
		
	}
	
	$scope.moveToDashboard = function(){
	
		if($rootScope.loginSuccess){
			
			$state.go('home');
			
		}else{
			$state.go("login");
		}
	}
	
	$scope.logout = function(){
		$rootScope.loginSuccess = false;
		$rootScope.currentUser = {};
		$state.go("login");
	}

});
//homeController
amsApp.controller('homeController', function($scope,$location,$rootScope,$http, $state, $stateParams) {
	
	$rootScope.selfHelpData = {};
	$scope.moveToConfig = function(){
		if($rootScope.loginSuccess){
			
			$state.go('configuration');
			
		}else{
			$state.go("login");
		}
	}
	$scope.allConfigs =[];
	if ($rootScope.currentUser.role === 'Admin'){
		$scope.getApplicationDataUrl = "http://app2900.gha.kfplc.com:9040/application/get";
		$rootScope.adminLogin = true;
	}
	else{
		$scope.getApplicationDataUrl = "http://app2900.gha.kfplc.com:9040/application/getTree?role="+$rootScope.currentUser.role;
	}
	$http.get($scope.getApplicationDataUrl)
			.then(function successCallback(response) {
				$scope.allConfigs = response.data;
				console.log($scope.allConfigs);
				
			},function errorCallback(data) {
				console.log(data);
			});
	
	$scope.navigation = function(idx){
		if($rootScope.loginSuccess){
			
			if($scope.allConfigs[idx].name === 'Self_Help_Portal'){
				
				$scope.appSelected='selfhelp';
				$rootScope.selfHelpData=$scope.allConfigs[idx];
				$state.go($scope.appSelected);
				
			}
			if($scope.allConfigs[idx].standalone){
				
				$scope.appSelected='standalone';
				//$rootScope.standAloneUrl='http://app2900.gha.kfplc.com:9080/IDOCTable/';
				$rootScope.standAloneUrl=angular.copy($scope.allConfigs[idx].application_url);
				$state.go($scope.appSelected);
				
			}
			
			
		}else{
			$state.go("login");
		}
	}
	
	$scope.logout = function(){
		$rootScope.loginSuccess = false;
		$rootScope.currentUser = {};
		$state.go("login");
		
	}
});

//LoginController
amsApp.controller('LoginController', function($scope,$location,$rootScope,$http, $state, $stateParams) {

	$rootScope.loginSuccess = false;
	$scope.formSubmit = function(){
		
		$scope.loginFailed=false;
		$scope.loginUrl = 'users/users.json';
		$rootScope.currentUser = {};
		$rootScope.adminLogin = false;
		$scope.existingUsers = [];
		$http.get($scope.loginUrl)
			.then(function successCallback(response) {
				$scope.existingUsers = response.data;
				for(var i=0; i<$scope.existingUsers.length; i++){
					if($scope.creds.username === $scope.existingUsers[i].username && $scope.creds.passwd === $scope.existingUsers[i].pwd){
						
						$rootScope.loginSuccess = true;
						$scope.loginFailed=false;
						$rootScope.currentUser.username = $scope.existingUsers[i].username;
						$rootScope.currentUser.role = $scope.existingUsers[i].role;
						$rootScope.adminLogin = false;
						$state.go("home");
						
					}
				}
			},function errorCallback(data) {
				console.log(data);
				$rootScope.loginSuccess = false;
				$scope.loginFailed=true;
				$state.go("login");
			});
			
			if(!$rootScope.loginSuccess){
				$rootScope.loginSuccess = false;
				$scope.loginFailed=true;
				$state.go("login");
			}
	}
	
});

amsApp.filter("unique", function() {
  // we will return a function which will take in a collection
  // and a keyname
  return function(collection, keyname) {
    // we define our output and keys array;
    var output = [],
      keys = [];

    // we utilize angular's foreach function
    // this takes in our original collection and an iterator function
    angular.forEach(collection, function(item) {
      // we check to see whether our object exists
      var key = item[keyname];
      // if it's not already part of our keys array
      if (keys.indexOf(key) === -1) {
        // add it to our keys array
        keys.push(key);
        // push this item to our final output array
        output.push(item);
      }
    });
    // return our array which should be devoid of
    // any duplicates
    return output;
  };
});

//});