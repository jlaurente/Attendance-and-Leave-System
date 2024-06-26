

app.controller('TimeEnrtyCtrl', function ($timeout,dateFilter,$routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {

	$scope.updateTime = function(){
    	$timeout(function(){
        $scope.theclock = (dateFilter(new Date(), 'hh:mm:ss'));
        $scope.updateTime();
    },1000);
	};
	$scope.updateTime();
	$scope.today = new Date();
 
  $scope.addtimeEntry = function(employee){
    Data.post('addTimeEntry',{employee: employee}).then(function (results) {
      Data.toast(results);
      $route.reload();
    });
  }
	$scope.logout = function () {
		Data.get('logout').then(function (results) {
    		Data.toast(results);
    		$location.path('login');
		});
	}
});
