app.filter('minLength', function(){
  return function(input, len, pad){
    input = input.toString(); 
    if(input.length >= len) return input;
    else{
      pad = (pad || 0).toString(); 
      return new Array(1 + len - input.length).join(pad) + input;
    }
  };
});
app.controller('ItemCtrl', function ($routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
  pre_blocker('on');
  Data.get('getItem').then(function (results) {
    $scope.itemList = results;
     pre_blocker('off');
  });
  $scope.selectedRow = null;  // initialize our variable to null
  $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
    $scope.selectedRow = index;
  }


  $scope.deleteUser = function(store_code,username){
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
        Data.get('deleteUser/'+store_code+'/'+username).then(function (results) {
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

app.controller('AddItemCtrl', function ($routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
  pre_blocker('on');
  Data.get('getCategory').then(function (results) {
    $scope.categoryList = results;
     pre_blocker('off');
  });
  Data.get('getBarcodeDetails').then(function (results) {
    $scope.barcodeList = results;
     pre_blocker('off');
  });
 

  $scope.addItem = function(customer){
    console.log(customer);
    // Data.post('addItem',{customer: customer}).then(function (results) {
    //   Data.toast(results);
    //   if(results.status == "success") {
    //     $route.reload();
    //   }
    // });
  }

  $scope.deleteUser = function(store_code,username){
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
        Data.get('deleteUser/'+store_code+'/'+username).then(function (results) {
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