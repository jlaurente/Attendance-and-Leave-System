app.controller('ScheduleCtrl', function ($routeParams,toaster,$modal,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
  pre_blocker('on');
  Data.get('getSchedule').then(function (results) {
    $scope.scheduleList = results;
     pre_blocker('off');
  });
 
  $scope.logout = function () {
      Data.get('logout').then(function (results) {
          Data.toast(results);
          $location.path('login');
      });
  }

  $scope.newSchedule = function(){
    var modalInstance = $modal.open({
      templateUrl: 'modal/new_schedule.html',
      backdrop:'static',
      keyboard:false,
      controller: function($scope, $modalInstance) {
        $scope.addSchedule = function(customer){
          if($('#start_time').val() == ""){
            toaster.pop("error", "", "Required field start time is missing or empty", 2000, 'trustedHtml');
          }else if($('#end_time').val() == ""){
            toaster.pop("error", "", "Required field end time is missing or empty", 2000, 'trustedHtml');
          }else{
            Data.post('addSchedule',{"start_time":$('#start_time').val(),"end_time":$('#end_time').val()}).then(function (results) {
              Data.toast(results);
                $route.reload();
                $modalInstance.close();
            });
          }
        }
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }
    });
  }

});

