//(function() {
  //var amsApp = angular.module('AMSApp', ['ui.router', 'angularUtils.directives.dirPagination','angular-loading-bar','ngAnimate']);
  var amsApp = angular.module('AMSApp', ['ui.router','ngStorage']);
  
  amsApp.config(['$locationProvider','$stateProvider', '$urlRouterProvider', 
  function( $locationProvider, $stateProvider, $urlRouterProvider, $rootScope,) {
    $locationProvider.html5Mode(true).hashPrefix('!');
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
        url : '/',
        templateUrl : 'welcome.html',
		controller : 'welcomeController'
        
      })
	  .state('selfhelp', {
        url : '/selfhelp',
        templateUrl : 'selfhelp.html',
        controller : 'shelpCtrl'
      });
	  
	  $urlRouterProvider.otherwise('/');
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
amsApp.controller('welcomeController', function($rootScope,$scope,$state, $stateParams,  $sce, $http, $location, accountServices,$localStorage) {
	
	$rootScope.welcomeScr = false;
	$rootScope.adminLoginSelection = false;
	//var configParams = accountServices.getConfigParams();
	accountServices.getConfigParams()
		.then(function successCallback(response) {
			$rootScope.configParams = angular.copy(response.data);
			console.log("after the service call");
			console.log($rootScope.configParams);
		
		}, function errorCallback (data) {
			console.log("Error getting data");
			console.log(data);
		
		});
		
		
	//console.log($rootScope.configParams);
	$scope.access_token = $location.hash();
	//console.log('Access Token is: '+ $scope.access_token);
	if($scope.access_token === ''){
		console.log('Access Token is: '+ $scope.access_token);

	}else{
		//console.log('Access Token is: '+ $scope.access_token);
		$localStorage.token = $scope.access_token.split('&')[0].split('=')[1];
		console.log($localStorage.token)
		$location.hash('');
		console.log('logged user is: ');
		console.log(accountServices.getClaimsFromToken());
	}
	$scope.proceedToLogin = function(){
		$rootScope.welcomeScr = true;
		console.log("Redirecting to Login page");
		$rootScope.adminLoginSelection = false;
		accountServices.loginUser();
		//$state.go('login');
	}
	
	$scope.proceedToAdminLogin = function(){
		$rootScope.welcomeScr = true;
		$rootScope.adminLoginSelection = true;
		$state.go('login');
	}
  
	
});	
amsApp.controller('shelpCtrl', function($scope,$state, $stateParams, $rootScope, $sce, $http) {


	for (var i=0; i< $rootScope.selfHelpData.modules.length;i++){
		$rootScope.selfHelpData.modules[i].expanded = false;
	}
		
		
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
amsApp.controller('ConfigurationController', function($scope,$location, $anchorScroll,$http, $state, $stateParams, $rootScope,$timeout) {

	$scope.buttonName = '';
	$scope.temp = {
		appName:'', modName:'',topicName:'' ,topicUrl:'',topicRoles:[]
	};

	$scope.config={};
	$scope.rolesList=[];
	$scope.selectedIndex = 0;
	
	$scope.allConfigs = [];
	$scope.edit = false;
	$scope.error = false;
	$scope.incomplete = false;
	$scope.hideform = true;
	$scope.configs = [];
	/*
		"appDataEndPointAD":"/application/get",
		"appPostEndPointAD":"/application/add",
		"appDataEndPoint":"/application/getTree?role=",
		"topicAddEndPointAD":"/topic/add",
		"moduleAddEndPointAD":"/module/add",
		"roleEndPointAD":"/role/get",
	*/
	$scope.getApplicationDataUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.appDataEndPointAD;
	$scope.postTopicDataUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.topicAddEndPointAD;
	$scope.postApplicationDataUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.appPostEndPointAD;
	$scope.currentTab = 1;
	
	$scope.postModuleDataUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.moduleAddEndPointAD;
	$scope.getRolesListUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.roleEndPointAD;
	$scope.allConfigs = [];
	

	$scope.getAppData = function() {
		console.log('getting application data');
		$scope.tmp = {};
		$scope.allConfigs = [];
		
	//Application response	
		$http.get($scope.getApplicationDataUrl)
			.then(function successCallback(response) {
				$scope.allConfigs = response.data;
				console.log($scope.allConfigs);
				$scope.convertJson();
				$scope.getModuleData();
			},function errorCallback(data) {
				console.log(data);
			});
		
		$http.get($scope.getRolesListUrl)
		.then(function successCallback(response) {
			$scope.rolesList = response.data;
			},function errorCallback(data) {
				console.log('failed while fetching roles');
			});
	};
	
	// Module response
	$scope.getModuleData = function() {
		$scope.moduletmp = {};
		$scope.allModuleConfigs = [];
		//console.log($scope.allConfigs);
		for (var i=0;i<$scope.allConfigs.length; i++){
			/*$scope.moduletmp = {};
			$scope.moduletmp.appName = angular.copy($scope.allConfigs[i].name);
			$scope.moduletmp.appDescription = angular.copy($scope.allConfigs[i].description);
			$scope.moduletmp.modName = '';*/
			for (var j=0; j< $scope.allConfigs[i].modules.length;j++){
				$scope.moduletmp = {};
				$scope.moduletmp.appName = angular.copy($scope.allConfigs[i].name);
				$scope.moduletmp.appId = angular.copy($scope.allConfigs[i].id);
				$scope.moduletmp.appDescription = angular.copy($scope.allConfigs[i].description);
				$scope.moduletmp.modName = angular.copy($scope.allConfigs[i].modules[j].name);
				$scope.moduletmp.modId = angular.copy($scope.allConfigs[i].modules[j].id);
				if( $scope.moduletmp.modName != undefined){
				$scope.allModuleConfigs.push($scope.moduletmp);}
				else{
					$scope.moduletmp.modName = '';
					$scope.allModuleConfigs.push($scope.moduletmp);
				}
				//console.log($scope.moduletmp);
				
			}
			//console.log($scope.moduletmp);
		}
		console.log($scope.allModuleConfigs);
	};
	$scope.convertJson = function() {
		$scope.tmp = {};	
		$scope.configs = [];
		var tmpidx=0;
		//console.log($scope.allConfigs);
		for (var i=0;i<$scope.allConfigs.length;i++){
			$scope.tmp.appName = angular.copy($scope.allConfigs[i].name);
			$scope.tmp.appDescription = angular.copy($scope.allConfigs[i].description);
			$scope.tmp.appURL = angular.copy($scope.allConfigs[i].application_url);
			$scope.tmp.iconURL = angular.copy($scope.allConfigs[i].image_url);
			$scope.tmp.appId = angular.copy($scope.allConfigs[i].id);
			for (var j=0;j<$scope.allConfigs[i].modules.length; j++){
				$scope.tmp.modName = angular.copy($scope.allConfigs[i].modules[j].name);
				$scope.tmp.modId = angular.copy($scope.allConfigs[i].modules[j].id);
				for (var k=0;k<$scope.allConfigs[i].modules[j].topics.length;k++){
					

					$scope.tmp.topicName = angular.copy($scope.allConfigs[i].modules[j].topics[k].name);
					$scope.tmp.topicId = angular.copy($scope.allConfigs[i].modules[j].topics[k].id);
					$scope.tmp.topicUrl = angular.copy($scope.allConfigs[i].modules[j].topics[k].url);
					$scope.tmp.topicRoles = angular.copy($scope.allConfigs[i].modules[j].topics[k].roles);
					//$scope.configs.push(tmp);
					$scope.configs[tmpidx] = angular.copy($scope.tmp);
					//console.log($scope.tmp);
					tmpidx++;
					
				}
			}
			
		}
		
	};
	
	$scope.selectedTab = function(tabSelected){
		$scope.currentTab = angular.copy(tabSelected);
	}
	
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
	$scope.moduleNamesForApp = [];
	$scope.getModulesOfSelectedApp = function(app){
		//console.log(idx);
		if($scope.topicUpdateFlag === false){
			for(var i=0;i<$scope.allConfigs.length; i++){
				if($scope.allConfigs[i].name === app){
					$scope.moduleNamesForApp = angular.copy($scope.allConfigs[i].modules );
					break;
				}
			}
		}
		
	}
	$scope.getAppData();
	
	$scope.editConfig = function(idx) {
	  $scope.config={};
	  $scope.moduleNamesForApp = [];
	  $scope.hideform = false;
	  $scope.edit = true;
	  $scope.topicUpdateFlag = false;
	  if (idx == 'new') {
		$scope.editFormHeader = 'Create new Config';
		$scope.incomplete = true;
		/*$scope.fName = '';
		$scope.lName = '';*/
		$scope.config= angular.copy($scope.temp);
		console.log($scope.config);
		console.log($scope.temp);
		console.log($scope.allConfigs);
		$scope.buttonName = 'SAVE';
		} else {
		$scope.topicUpdateFlag = true;
		$scope.editFormHeader = 'Edit selected Config';
		$scope.config = angular.copy($scope.configs[idx]);
		for(var i=0; i<$scope.allConfigs.length;i++){
				if($scope.allConfigs[i].name === $scope.config.appName){
					$scope.moduleNamesForApp = angular.copy($scope.allConfigs[i].modules );
					break;
				}
		}
		console.log($scope.config);
		$scope.buttonName = 'UPDATE'; 
		$scope.selectedIndex = idx;
	  }
	   $location.hash('bottomSection');
	   //scroll to bottom for ease of user
	   $anchorScroll();
	};
	
	$scope.editMod = function(idx){
		$scope.hideform = false;
		$scope.edit = true;
	  if (idx == 'new') {
		$scope.editFormHeader = 'Create new Module';
		$scope.config = {};

		$scope.buttonName = 'SAVE';
		} else {
		
		$scope.editFormHeader = 'Edit selected Module';
		$scope.config = angular.copy($scope.allModuleConfigs[idx]);
		console.log($scope.config);
		$scope.buttonName = 'UPDATE'; 
		$scope.selectedIndex = idx;
		
		}
		$location.hash('bottomSection');
	   //scroll to bottom for ease of user
	   $anchorScroll();
	}
	
	$scope.saveOrUpdateModule = function(){
		$scope.tmp={};
		if($scope.buttonName == 'SAVE'){
			$scope.tmp.name = angular.copy($scope.config.modName);
			var tmpApp = {};

			for(var i=0; i< $scope.allConfigs.length; i++){
				if($scope.allConfigs[i].name === $scope.config.appName){
						tmpApp.id = angular.copy($scope.allConfigs[i].id);
						break;
					}
			}
			$scope.tmp.application = tmpApp;
			console.log($scope.tmp);
			$http.post($scope.postModuleDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for Posting data");
				//$scope.getAppData();
			},function errorCallback(data) {
				console.log("Error in Posting data");
				//console.log(data);
				//$scope.getAppData();
			});
			
			$scope.hideform = true;
			$timeout($scope.getAppData(),2000);
		}
		if($scope.buttonName == 'UPDATE'){
			//$scope.configs[$scope.selectedIndex]= angular.copy($scope.config);
			//console.log($scope.configs);
			$scope.tmp={};
			$scope.tmp.id = angular.copy($scope.config.modId);
			var tmpApp = {};
			tmpApp.id = angular.copy($scope.config.appId);
			$scope.tmp.application = tmpApp;
			
			$scope.tmp.name = angular.copy($scope.config.modName);
			console.log($scope.tmp);
			$http.post($scope.postModuleDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for updating data");
				
			},function errorCallback(data) {
				console.log("Error in Posting data");
			});
			$scope.getAppData();
			$scope.hideform = true;
		}
		$location.hash('topSection');
		
		//scroll to Page Top for ease of user
		$anchorScroll();
		
	}
	
	$scope.saveOrUpdateTopic = function(){
		$scope.tmp={};
		$scope.topicUpdateFlag = false;
		if($scope.buttonName == 'SAVE'){
			console.log('In Topics Save function');
			//$scope.config.id=$scope.currentConfigs.length + 1;
			console.log($scope.config);
			$scope.tmp.name = $scope.config.topicName;
			$scope.tmp.url = $scope.config.topicUrl;
			var tmpTopicRoles = [];
			//console.log($scope.config.topicRoles);
			for(var i=0; i< $scope.config.topicRoles.length; i++){
				var tmpTopicRole={};
				for (var j=0; j<$scope.rolesList.length; j++){
					if($scope.rolesList[j].name === $scope.config.topicRoles[i]){
						tmpTopicRole.id = angular.copy($scope.rolesList[j].id);
						tmpTopicRoles.push(tmpTopicRole);
						break;
					}
				}

			}
			$scope.tmp.roles = tmpTopicRoles;
			var tmpModule = {};
			var tmpApp = {};
			console.log($scope.config.modName);
			for(var i=0; i< $scope.allConfigs.length; i++){
				for (var j=0; j<$scope.allConfigs[i].modules.length; j++){
					if($scope.allConfigs[i].modules[j].name === $scope.config.modName && $scope.allConfigs[i].name === $scope.config.appName){
						tmpModule.id = angular.copy($scope.allConfigs[i].modules[j].id);
						tmpApp.id = angular.copy($scope.allConfigs[i].id);
						break;
					}
				}
				/* if (tmpModule !== undefined){
				break;} */

			}
			//tmoAppName.name = $scope.config.appName;
			//tmpModule.application = tmoAppName;
			$scope.tmp.module = tmpModule;
			$scope.tmp.application = tmpApp;
			//$scope.configs.push($scope.config);
			console.log('Selected Topic Data');
			//console.log($scope.configs);
			console.log($scope.tmp);
			$http.post($scope.postTopicDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for Posting data");
				$scope.getAppData();
			},function errorCallback(data) {
				console.log("Error in Posting data");
				$scope.getAppData();
			});
			$scope.hideform = true;
		}
		if($scope.buttonName == 'UPDATE'){
			$scope.topicUpdateFlag = true;
			//$scope.configs[$scope.selectedIndex]= angular.copy($scope.config);
			$scope.tmp.id = angular.copy($scope.config.topicId);
			$scope.tmp.name = angular.copy($scope.config.topicName);
			$scope.tmp.url = angular.copy($scope.config.topicUrl);
			var tmpModule = {};
			var tmpApp = {};
			tmpModule.id = angular.copy($scope.config.modId);
			tmpApp.id = angular.copy($scope.config.appId);
			$scope.tmp.module = tmpModule;
			$scope.tmp.application = tmpApp;
			var tmpTopicRoles = [];
			//console.log($scope.config.topicRoles);
			for(var i=0; i< $scope.config.topicRoles.length; i++){
				var tmpTopicRole={};
				for (var j=0; j<$scope.rolesList.length; j++){
					if($scope.rolesList[j].name === $scope.config.topicRoles[i]){
						tmpTopicRole.id = angular.copy($scope.rolesList[j].id);
						tmpTopicRoles.push(tmpTopicRole);
						break;
					}
				}

			}
			$scope.tmp.roles = tmpTopicRoles;
			//console.log($scope.config);
			console.log($scope.tmp);
			$http.post($scope.postTopicDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for Posting data");
				$scope.getAppData();
				
			},function errorCallback(data) {
				console.log("Error in Posting data");
				$scope.getAppData();
			});
			$scope.hideform = true;
		}
		$scope.config = {};
		
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
	
	$scope.editApps = function(idx){
		$scope.hideform = false;
		$scope.edit = true;
	  if (idx == 'new') {
		$scope.editFormHeader = 'Create new Application';
		$scope.selectedApp = {};

		$scope.buttonName = 'SAVE';
		} else {
		
		$scope.editFormHeader = 'Edit selected Config';
		$scope.selectedApp = angular.copy($scope.allConfigs[idx]);
		console.log($scope.selectedApp);
		$scope.buttonName = 'UPDATE'; 
		$scope.selectedIndex = idx;
		
		}
		$location.hash('bottomSection');
	   //scroll to bottom for ease of user
	   $anchorScroll();
	}
	
	$scope.saveOrUpdateApplication = function(){
		$scope.tmp={};
		if($scope.buttonName == 'SAVE'){
			$scope.tmp.name = angular.copy($scope.selectedApp.name);
			$scope.tmp.description = angular.copy($scope.selectedApp.description);
			$scope.tmp.image_url = angular.copy($scope.selectedApp.image_url);
			$scope.tmp.application_url = angular.copy($scope.selectedApp.application_url);
			$scope.tmp.standalone = angular.copy($scope.selectedApp.standalone);
			
			$http.post($scope.postApplicationDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for Posting data");
				$scope.getAppData();
			},function errorCallback(data) {
				console.log("Error in Posting data");
				$scope.getAppData();
			});
			$scope.hideform = true;
		}
		if($scope.buttonName == 'UPDATE'){
			//$scope.configs[$scope.selectedIndex]= angular.copy($scope.config);
			//console.log($scope.configs);
			$scope.tmp.id = angular.copy($scope.selectedApp.id);
			$scope.tmp.name = angular.copy($scope.selectedApp.name);
			$scope.tmp.description = angular.copy($scope.selectedApp.description);
			$scope.tmp.image_url = angular.copy($scope.selectedApp.image_url);
			$scope.tmp.application_url = angular.copy($scope.selectedApp.application_url);
			$scope.tmp.standalone = angular.copy($scope.selectedApp.standalone);
			
			$http.post($scope.postApplicationDataUrl,$scope.tmp)
			.then(function successCallback(response) {
				//$scope.allConfigs = response.data;
				console.log("SUCCESS for updating data");
				//$scope.getAppData();
			},function errorCallback(data) {
				console.log("Error in Posting data");
				//$scope.getAppData();
			});
			$scope.hideform = true;
			$timeout($scope.getAppData(),1000);
		}
		$location.hash('topSection');
		//scroll to Page Top for ease of user
		$anchorScroll();
		
	}
	
	$scope.removeComponent = function(component, id){
		
		var tmp= {};
		var action = '/delete';
		var idxApp, idxMod;
		tmp.id = id;
		$scope.delError = '';
		$scope.dispTheDelErrorModal = false;
		$scope.proceedDeletion = false;
		if(component === 'application'){
			for ( var i=0;i<$scope.allConfigs.length; i++){
				if($scope.allConfigs[i].id === id){
					idxApp = i;
					break;
				}
			}
			if ($scope.allConfigs[idxApp].modules.length > 0 ){
				$scope.delError = 'Please delete its modules first';
				$scope.dispTheDelErrorModal = true;
				$scope.proceedDeletion = false;
				window.alert($scope.delError);
			} else {
				$scope.proceedDeletion = true;
			}
		}
		
		if(component === 'module'){
			//console.log(id);
			for ( var i=0;i<$scope.allConfigs.length; i++){
				for ( var j=0;j<$scope.allConfigs[i].modules.length; j++){
					if($scope.allConfigs[i].modules[j].id === id){
						idxApp = angular.copy(i);
						idxMod = angular.copy(j);
						//console.log(idxApp);
						//console.log(idxMod);
						//console.log('matched');
						break;
					}
				}
				if(idxApp === i){
					//console.log(idxApp);
					//console.log(i);
					break;
				}
			}
			console.log(idxApp);
			console.log(idxMod);
			console.log($scope.allConfigs[idxApp].modules[idxMod]);
			if ($scope.allConfigs[idxApp].modules[idxMod].topics.length > 0 ){
				$scope.delError = 'Please delete its topics first';
				$scope.dispTheDelErrorModal = true;
				$scope.proceedDeletion = false;
				window.alert($scope.delError);
			} else {
				$scope.proceedDeletion = true;
			}
		}
		
		if(component === 'topic'){
			
			if( id !== undefined){
				$scope.proceedDeletion = true;
			}
			
		}
		
		if($scope.proceedDeletion){
			$scope.delEndpoint = $rootScope.configParams.appEndPointHost + '/' + component + action;
				console.log('Delete End point '+$scope.delEndpoint);
				console.log('of ID ');
				console.log(tmp);
				//$http.delete($scope.delEndpoint,tmp)
				/*$http( angular.merge({}, {}, {
					method  : 'delete',
					url     : $scope.delEndpoint,
					data    : tmp
				}))*/
				$http({
					method: 'DELETE',
					url: $scope.delEndpoint,
					data: tmp,
					headers: {
						'Content-type': 'application/json;charset=utf-8'
					}
				})
				.then(function successCallback(response){
					console.log('deleted');
					//window.alert('deleted');
					$timeout($scope.getAppData(),1000);
				},function errorCallback(response){
					console.log('delete failed');
					console.log(response.data);
				});
		}
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
		//$scope.getApplicationDataUrl = "http://app2900.gha.kfplc.com:9040/application/get";
		$scope.getApplicationDataUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.appDataEndPointAD;
		$rootScope.adminLogin = true;
	}
	else{
		//$scope.getApplicationDataUrl = "http://app2900.gha.kfplc.com:9040/application/getTree?role="+$rootScope.currentUser.role;
		$scope.getApplicationDataUrl = $rootScope.configParams.appEndPointHost + $rootScope.configParams.appDataEndPoint+$rootScope.currentUser.role;
	}
	console.log($scope.getApplicationDataUrl);
	$http.get($scope.getApplicationDataUrl)
			.then(function successCallback(response) {
				$scope.allConfigs = response.data;
				console.log($scope.allConfigs);
				
			},function errorCallback(data) {
				console.log(data);
			});
	
	$scope.navigation = function(idx){
		if($rootScope.loginSuccess){
			
			//if($scope.allConfigs[idx].name === 'Self_Help_Portal'){
			if(!$scope.allConfigs[idx].standalone){
				
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
amsApp.controller('LoginController', function($scope,$location,$rootScope,$http, $state, $stateParams,accountServices) {

	$rootScope.loginSuccess = false;
	console.log($rootScope.configParams);
	$scope.formSubmit = function(){
		
		$scope.loginFailed=false;
		$scope.loginUrl = 'users/users.json';
		$rootScope.currentUser = {};
		$rootScope.adminLogin = false;
		$scope.existingUsers = [];
		
		if($rootScope.adminLoginSelection){
			
			$http.post($rootScope.configParams.adLoginUrl,$scope.creds)
			.then(function successCallback(response) {
				$scope.loginStatus = angular.copy(response.data);
				$rootScope.adminLogin = true;
				$rootScope.loginSuccess = true;
				$scope.loginFailed=false;
				$rootScope.currentUser.username = $scope.creds.username;
				$rootScope.currentUser.role = "Admin";
				console.log("after the service call");
				console.log($scope.loginStatus);
				$state.go('home');
				
			
			}, function errorCallback (data) {
				console.log("Error getting data");
				$rootScope.adminLogin = false;
				$rootScope.loginSuccess = false;
				$scope.loginFailed=true;
				console.log(data);
			
			});
				
			
			
		}
		
		if(!$rootScope.adminLoginSelection){
			
			
			$http.get($scope.loginUrl)
				.then(function successCallback(response) {
					$scope.existingUsers = response.data;
					for(var i=0; i<$scope.existingUsers.length; i++){
						if($scope.creds.username === $scope.existingUsers[i].username && $scope.creds.password === $scope.existingUsers[i].pwd){
							
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
	}
	
});

amsApp.factory('accountServices',['$http','$rootScope','$window','$localStorage',function($http, $rootScope,$window,$localStorage){
		var fac = {};
		
		fac.logoffUser = function(){
			$rootScope.acc_token = '';
			var configs = {};
			fac.httpCall("config/configParamsPROD.json").then(function successCallback(response) {
				configs = response.data;
				
				//console.log(configs);
				var redirectUrl = ""+ configs.msBaseUrl + configs.tenantId + configs.logoutConnector1 + configs.logoutRedirectUri  ;
				//console.log(redirectUrl);
				$window.location.href = redirectUrl;
				
				
			}, function errorCallback (data) {
				console.log("Error reading the file");
				console.log(data);
				
			});
			
			//$window.location.href = 'https://login.microsoftonline.com/8b7425f8-ed1a-4703-b748-5d8aa9d83471/oauth2/v2.0/logout?post_logout_redirect_uri=https://localhost:8080/logout/'
		}
		fac.httpCall = function(serviceUrl){
			console.log('In the http call service. URL is '+serviceUrl);
			return $http.get(serviceUrl);
			
		}
		
		fac.loginUser = function(){
			
			var configs  = {};
			//configs = fac.getConfigParams();
			fac.httpCall("config/configParamsPROD.json").then(function successCallback(response) {
				configs = response.data;
				
				//console.log(configs);
				var redirectUrl = ""+configs.msBaseUrl + configs.tenantId + configs.connector1 + configs.clientId + configs.connector2 + configs.redirectUri  + configs.connector3 + configs.state + configs.connector4 + configs.nonce ;
				//console.log(redirectUrl);
				$window.location.href = redirectUrl;
				
				
			}, function errorCallback (data) {
				console.log("Error reading the file");
				console.log(data);
				
			});
			
		}
		urlBase64Decode = function(str) {
			var output = str.replace('-', '+').replace('_', '/');
			switch (output.length % 4) {
				case 0:
					break;
				case 2:
					output += '==';
					break;
				case 3:
					output += '=';
					break;
				default:
					throw 'Illegal base64url string!';
			}
			return window.atob(output);
		}
 
		fac.getClaimsFromToken = function() {
			var token = $localStorage.token;
			var user = {};
			if (typeof token !== 'undefined') {
				var encoded = token.split('.')[1];
				user = JSON.parse(urlBase64Decode(encoded));
			}
			return user;
		}
		
		fac.getConfigParams = function(){
			//var configs={};
			return fac.httpCall("config/configParamsPROD.json");
			//return $rootScope.configs;
		}
		return fac;
	}]);

	amsApp.config(['$httpProvider', function ($httpProvider) {
	$httpProvider.interceptors.push(['$q', '$location','$rootScope', function ($q, $location, $rootScope) {
		return {
			'request': function (config) {
				config.headers = config.headers || {};
				if ($rootScope.acc_token) {
					config.headers.Authorization = 'Bearer ' + $rootScope.acc_token;
					//console.log("In Header"+config.headers.Authorization);
				}
				return config;
			},
			'responseError': function (response) {
				if (response.status === 401 || response.status === 403) {
					console.log("Something went wrong")
				}
				return $q.reject(response);
			}
		};
		}]);
	}]);

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