app.controller('SettingsCtrl', function ($routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
  pre_blocker('on');
  Data.get('getEmpDetails').then(function (results) {
    $scope.userList = results;
     pre_blocker('off');
  });
  
  $scope.selectedRow = null;  // initialize our variable to null
  $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
    $scope.selectedRow = index;
  }
 
  $scope.logout = function () {
      Data.get('logout').then(function (results) {
          Data.toast(results);
          $location.path('login');
      });
  }
});

