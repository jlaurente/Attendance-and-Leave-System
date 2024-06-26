app.controller('UserCtrl', function ($modal,$routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
  pre_blocker('on');
  Data.get('getUsers').then(function (results) {
    $scope.userList = results;
     pre_blocker('off');
  });
  $scope.selectedRow = null;  // initialize our variable to null
  $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
    $scope.selectedRow = index;
  }

  $scope.newEmployee = function(){
    var modalInstance = $modal.open({
      templateUrl: 'modal/new_employee.html',
      backdrop:'static',
      keyboard:false,
      controller: function($scope, $modalInstance) {
        Data.get('getRole').then(function (results) {
          $scope.roleList = results;
        });

        Data.get('getPosition').then(function (results) {
          $scope.posList = results;
        });

        Data.get('getSchedule').then(function (results) {
          $scope.scheduleList = results;
        });

        Data.get('getEmpDetails').then(function (results) {
          $scope.emptypeList = results;
        });
        $scope.addEmployee = function(customer){
          pre_blocker('on');
          Data.post('addUser',{customer: customer}).then(function (results) {
            Data.toast(results);
            $route.reload();
            $modalInstance.close();
            pre_blocker('off');
          });
        }
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }
    });
  }

  $scope.editEmployee = function(id){
    var modalInstance = $modal.open({
      templateUrl: 'modal/edit_employee.html',
      backdrop:'static',
      keyboard:false,
      controller: function($scope, $modalInstance) {
        Data.get('getRole').then(function (results) {
          $scope.roleList = results;
        });

        Data.get('getPosition').then(function (results) {
          $scope.posList = results;
        });

        Data.get('getSchedule').then(function (results) {
          $scope.scheduleList = results;
        });

        Data.get('getEmpDetails').then(function (results) {
          $scope.emptypeList = results;
        });
        Data.get('editUser/'+id).then(function(results){
          $scope.listUser = results['user'];
          for(var i=0;i<$scope.listUser.length;i++){
            $scope.schedule = $scope.listUser[i]['schedule_id'];
            $scope.role_id = $scope.listUser[i]['role_id'];
            $scope.position = $scope.listUser[i]['position_id'];
            $scope.emptype = $scope.listUser[i]['employee_type']
          }
        });
        $scope.editEmployee = function(customer){
          console.log(customer);
          // pre_blocker('on');
          // Data.post('addUser',{customer: customer}).then(function (results) {
          //   Data.toast(results);
          //   $route.reload();
          //   $modalInstance.close();
          //   pre_blocker('off');
          // });
        }
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }
    });
  }

  $scope.deleteUser = function(id){
    SweetAlert.swal({
        title: "Are you sure?", //Bold text
        text: "You want to delete this user.", //light text
        type: "warning", //type -- adds appropiriate icon
        showCancelButton: true, // displays cancel btton
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, proceed!",
        closeOnConfirm: true, //do not close popup after click on confirm, usefull when you want to display a subsequent popup
        closeOnCancel: true
    }, 
    function(isConfirm){ //Function that triggers on user action.
     
      if(isConfirm){
        Data.get('deleteUser/'+id).then(function (results) {
            Data.toast(results);
            if(results.status == "success") {
              $route.reload();
            }
        });
      } else {
          setTimeout($.loadingBlockHide, true);
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


app.controller('EditUserCtrl', function ($routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {

  Data.get('getRole').then(function (results) {
    $scope.roleList = results;
  });

  Data.get('getPosition').then(function (results) {
    $scope.posList = results;
  });

  Data.get('getSchedule').then(function (results) {
    $scope.scheduleList = results;
  });

  Data.get('getEmpDetails').then(function (results) {
    $scope.emptypeList = results;
  });

  Data.get('editUser/'+$routeParams.id).then(function(results){
    $scope.listUser = results['user'];
    for(var i=0;i<$scope.listUser.length;i++){
      $scope.schedule = $scope.listUser[i]['schedule_id'];
      $scope.role_id = $scope.listUser[i]['role_id'];
      $scope.position = $scope.listUser[i]['position_id'];
      $scope.emptype = $scope.listUser[i]['employee_type']
    }
  });
  
  $scope.updateUser=function(customer){
    console.log(customer);
    // Data.put('updateUser/'+$routeParams.store_code+'/'+$routeParams.username,{customer: customer}).then(function (results) {
    //   Data.toast(results);
    // });
  }
 
  $scope.logout = function () {
      Data.get('logout').then(function (results) {
          Data.toast(results);
          $location.path('login');
      });
  }
});

app.controller('ChangePassCtrl', function ($routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
  // pre_blocker('on');
  Data.get('getUser/'+$routeParams.uid).then(function(results){
    $scope.listUser = results;
  });
 
  $scope.changePass = function(user){
    Data.put('changePass/'+$routeParams.uid,{user: user}).then(function (results) {
      Data.toast(results);
      user.oldPass='';
    });
  }
 
  $scope.logout = function () {
    Data.get('logout').then(function (results) {
        Data.toast(results);
        $location.path('login');
    });
  }
});

app.controller('ProfileCtrl', function ($routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
 
 
  $scope.logout = function () {
    Data.get('logout').then(function (results) {
        Data.toast(results);
        $location.path('login');
    });
  }
});