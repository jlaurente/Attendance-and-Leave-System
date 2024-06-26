app.controller('LeaveCtrl', function ($modal,$routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
	
	Data.get('getLeave').then(function (results) {
	    $scope.leaveList = results;
	});

  	$scope.newLeave = function(){
		var modalInstance = $modal.open({
		  templateUrl: 'modal/new_leave.html',
		  backdrop:'static',
		  keyboard:false,
		  controller: function($scope, $modalInstance) {
		    $scope.addLeave = function(customer){
		      console.log(customer);
		    }
		    $scope.cancel = function() {
		      $modalInstance.dismiss('cancel');
		    };
		  }
		});
	}
 
  	$scope.logout = function () {
  		Data.get('logout').then(function (results) {
      		Data.toast(results);
      		$location.path('login');
  		});
  	}
});
