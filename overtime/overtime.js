app.controller('OvertimeCtrl', function (toaster,$modal,$routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
	Data.get('getOvertime').then(function (results) {
  		$scope.otList = results;
	});

  	Data.get('getApproveOt').then(function (results) {
  		$scope.ApproveOt = results;
	});

	Data.get('getdisApproveOt').then(function (results) {
  		$scope.disApproveOt = results;
	});

  	$scope.newOvertime = function(){
		var modalInstance = $modal.open({
		  templateUrl: 'modal/new_overtime.html',
		  backdrop:'static',
		  keyboard:false,
		  controller: function($scope, $modalInstance) {
		    $scope.addOvertime = function(customer){

		      if($('#start_time').val() == ""){
		      	toaster.pop("error", "", "Required field start time is missing or empty", 2000, 'trustedHtml');
		      }else if($('#end_time').val() == ""){
		      	toaster.pop("error", "", "Required field end time is missing or empty", 2000, 'trustedHtml');
		      }else if($('#ot_date').val() == ""){
		      	toaster.pop("error", "", "Required field overtime date is missing or empty", 2000, 'trustedHtml');
		      }else if($('#reason').val() == ""){
		      	toaster.pop("error", "", "Required field reason is missing or empty", 2000, 'trustedHtml');
		      }else{
		      	Data.post('addOvertime',{"ot_date":$('#ot_date').val(),"start_time":$('#start_time').val(),"end_time":$('#end_time').val(),"reason":$('#reason').val()}).then(function (results) {
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

	$scope.editOvertime = function(id){
	    var modalInstance = $modal.open({
	      templateUrl: 'modal/edit_overtime.html',
	      backdrop:'static',
	      keyboard:false,
	      controller: function($scope, $modalInstance) {
	        Data.get('editOvertime/'+id).then(function(results){
	          $scope.listOT = results;
	        });
	        $scope.updateOT = function(customer){
	          Data.put('updateOvertime',{"id":id,"ot_date":$('#ot_date').val(),"start_time":$('#start_time').val(),"end_time":$('#end_time').val(),"reason":$('#reason').val()}).then(function (results) {
		        Data.toast(results);
	            $route.reload();
	            $modalInstance.close();
	      	  });
	        }
	        $scope.cancel = function() {
	          $modalInstance.dismiss('cancel');
	        };
	      }
	    });
  	}

  	$scope.OTapproved = function(id){
	    Data.get('approveOT/'+id).then(function (results) {
	        Data.toast(results);
	        $route.reload();
  	  	});
  	}

  	$scope.OTdisapproved = function(id){
	    Data.get('disapprovedOT/'+id).then(function (results) {
	        Data.toast(results);
	        $route.reload();
  	  	});
  	}

  	$scope.deleteUser = function(id){
	    SweetAlert.swal({
	        title: "Are you sure?", //Bold text
	        text: "You want to delete.", //light text
	        type: "warning", //type -- adds appropiriate icon
	        showCancelButton: true, // displays cancel btton
	        confirmButtonColor: "#DD6B55",
	        confirmButtonText: "Yes, proceed!",
	        closeOnConfirm: true, //do not close popup after click on confirm, usefull when you want to display a subsequent popup
	        closeOnCancel: true
	    }, 
	    function(isConfirm){ //Function that triggers on user action.
	     
	      if(isConfirm){
	        Data.get('deleteOvertime/'+id).then(function (results) {
	            Data.toast(results);
	            $route.reload();
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

// app.controller('ApproveOTCtrl', function (toaster,$modal,$routeParams,$scope,DTOptionsBuilder, DTColumnBuilder,DTColumnDefBuilder, Data, $location,$route,SweetAlert) {
// 	Data.get('getApproveOt').then(function (results) {
//   		$scope.otList = results;
// 	});

//   	$scope.logout = function () {
//   		Data.get('logout').then(function (results) {
//       		Data.toast(results);
//       		$location.path('login');
//   		});
//   	}
// });