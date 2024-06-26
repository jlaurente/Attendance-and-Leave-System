app.controller('ReportsCtrl', function ($http, $scope, $rootScope, $routeParams, $location, toaster, Data) {
  
  Data.get('getSupplier').then(function(results){
    $scope.Supplier = results;
  });
  Data.get('getGroup').then(function(results){
    $scope.Group = results;
  });
  Data.get('getStore').then(function(results){
    $scope.Store = results;
  });

  $scope.search = function () {
    $.loadingBlockShow({
      imgPath: 'img/Gear.svg',
      text: 'Please wait while process...',
      style: 
      {
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: 'rgba(0.000%,0.000%,0.000%,0.8)',
        color: 'rgb(255, 255, 255)',
        left: 0,
        top: 0,
        zIndex: 10000
      }
    });
    console.log($scope.supplier);
    if($scope.create_from!=undefined && $scope.create_to!=undefined && $scope.ptcycle!=undefined){
      $http.post('api/index.php/cmsReport', {
      'supplier':$scope.supplier, 'store':$scope.store,
      'group':$scope.group, 'ptcycle':$scope.ptcycle,
      'create_from':$scope.create_from, 'create_to':$scope.create_to,
      'period_start_from':$scope.period_start_from, 'period_end_to':$scope.period_end_to
      }).success(function (results) {

        if(results=='error')
        {
          toaster.pop("error", "", "Error! no record found.", 2000, 'trustedHtml');
          setTimeout($.loadingBlockHide, true);
        }
        else{
          $scope.list = results;
          $scope.fileName = "CMS CONTRACT AND CHARGES REPORT";
          $scope.exportData = [];
          $scope.exportData.push(["CONTRACT NO.","SUPPLIER","SUPPLIER NAME","CONTRACT START","CONTRACT END","USERID","CON CREATE DATE","COM RATE","COMMENTS","CHARGEID","GROUP","GROUP NAME","DEPT","DEPARTMENT NAME","STORE","STORE NAME","BRAND","BRAND NAME","ITEM","COMM TYPE","AMT","CHARGE_NAME","PERCENTAGE","BASIS","CYCLE","CHARGE START","CHARGE END","POST DATE","POSTED STATUS","CHARGE CREATE DATE","DEAL NO"]);
          // Data:
          
          angular.forEach($scope.list, function(value, key) {
          $scope.exportData.push([value.CONNO,value.SUP,value.SUPNAME,value.CONTSTR,value.CONTEND,value.USERID,value.CONCREATE,value.COMRATE,value.COMMENTS,value.CHARGEID,value.GP,value.GPNAME,value.DEPT,value.DEPTNAME,value.STORES,value.STORENAME,value.BRAND,value.BRANDNAME,value.ITEM,value.COMTYPE,value.AMT,value.CHARGE_NAME,value.PERCENTAGE,value.BASIS,value.CYCLE,value.CHARSTR,value.CHAREND,value.POSTDATE,value.PSTATUS,value.CHARCREATE,value.DEALNO]);
          });
          setTimeout($.loadingBlockHide, true);
        }
      }) 
    }else{
      toaster.pop("error", "", " Collect date and posting cycle must not be empty.", 2000, 'trustedHtml');
      setTimeout($.loadingBlockHide, true);
    }
  };

  $scope.searchreim = function () {
    $.loadingBlockShow({
      imgPath: 'img/Gear.svg',
      text: 'Please wait while process...',
      style: 
      {
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: 'rgba(0.000%,0.000%,0.000%,0.8)',
        color: 'rgb(255, 255, 255)',
        left: 0,
        top: 0,
        zIndex: 10000
      }
    });
   
    if($scope.supplier!=undefined){
      $http.post('api/index.php/cmsrmsreimglReport', {
      'supplier':$scope.supplier, 
      'store':$scope.store,
      'group':$scope.group, 
      'ptcycle':$scope.ptcycle,
      'create_from':$scope.create_from, 
      'create_to':$scope.create_to,
      'period_start_from':$scope.period_start_from, 
      'period_end_to':$scope.period_end_to,
      'statuscms':$scope.statuscms

      }).success(function (results) {

        if(results=='error')
        {
          toaster.pop("error", "", "Error! no record found.", 2000, 'trustedHtml');
          setTimeout($.loadingBlockHide, true);
        }
        else{
          $scope.list = results;
          $scope.fileName = "CMS RMS vs REIM vs GL REPORT ";
          $scope.exportData = [];
          $scope.exportData.push(["CONTRACT NO.","SUPPLIER","SUPPLIER NAME","CONTRACT START","CONTRACT END","USERID","CON CREATE DATE","COM RATE","COMMENTS","CHARGEID","GROUP","GROUP NAME","DEPT","DEPARTMENT NAME","STORE","STORE NAME","BRAND","BRAND NAME","ITEM","COMM TYPE","AMT","POSTING AMT","CHARGE_NAME","PERCENTAGE","BASIS","CYCLE","CHARGE START","CHARGE END","POST DATE","POSTED STATUS","CHARGE CREATE DATE","DEAL NO","RMS COLLECT DATE","RMS STATUS","GL STATUS","REIM STATUS"]);
          // Data:
          
          angular.forEach($scope.list, function(value, key) {
          $scope.exportData.push([value.CONNO,value.SUP,value.SUPNAME,value.CONTSTR,value.CONTEND,value.USERID,value.CONCREATE,value.COMRATE,value.COMMENTS,value.CHARGEID,value.GP,value.GPNAME,value.DEPT,value.DEPTNAME,value.STORES,value.STORENAME,value.BRAND,value.BRANDNAME,value.ITEM,value.COMTYPE,value.AMT,value.FIXED_DEAL_AMT,value.CHARGE_NAME,value.PERCENTAGE,value.BASIS,value.CYCLE,value.CHARSTR,value.CHAREND,value.POSTDATE,value.PSTATUS,value.CHARCREATE,value.DEALNO,value.RMS_COLLECT_DATE,value.RMS_STATUS,value.GL_STATUS,value.REIM_STATUS]);
          });
          setTimeout($.loadingBlockHide, true);
        }
      })
    }else{
      toaster.pop("error", "", "Supplier must not be empty.", 2000, 'trustedHtml');
      setTimeout($.loadingBlockHide, true);
    } 
  };

  $scope.searchsales = function(){
    $.loadingBlockShow({
      imgPath: 'img/Gear.svg',
      text: 'Please wait while process...',
      style: 
      {
        position: 'fixed',
        width: '100%',
        height: '100%',
        background: 'rgba(0.000%,0.000%,0.000%,0.8)',
        color: 'rgb(255, 255, 255)',
        left: 0,
        top: 0,
        zIndex: 10000
      }
    });

    if($scope.supplier!=undefined && $scope.ptcycle!=undefined ){
        $http.post('api/index.php/cms_sales_report', {
        'supplier':$scope.supplier, 
        'store':$scope.store,
        'group':$scope.group, 
        'ptcycle':$scope.ptcycle,
        'period_start_from':$scope.period_start_from, 
        'period_end_to':$scope.period_end_to,
        'statuscms':$scope.statuscms

        }).success(function (results) {

          if(results=='error')
          {
            toaster.pop("error", "", "Error! no record found.", 2000, 'trustedHtml');
            setTimeout($.loadingBlockHide, true);
          }
          else{
            $scope.list = results;
            $scope.fileName = "SALES TARGET REPORT ";
            $scope.exportData = [];
            $scope.exportData.push(["CONTRACT NO.","SUPPLIER","SUPPLIER NAME","CONTRACT START","CONTRACT END","USERID","CON CREATE DATE","COM RATE","COMMENTS","CHARGEID","CHARGE CREATE DATE","CHARGE START","CHARGE END","GROUPS","GROUP NAME","DEPT","DEPT NAME","LOCATION","STORE NAME","BRAND","BRAND NAME","ITEM","COMM TYPE","POSTING CYCLE","MONTH","SALES TARGET","OPT","RATE","MIN_GUARANTEED","ACTUAL SALES","COLLECTION DATE","POSTED DATE","POSTED STATUS","POSTING AMT","DEAL NO","COLLECT START DATE","RMS STATUS","GL STATUS","REIM STATUS"]);
            // Data:
            
            angular.forEach($scope.list, function(value, key) {
            $scope.exportData.push([value.CONTRACT_NO,value.SUPPLIER_NO,value.SUPPLIER_NAME,value.CONTRACT_START,value.CONTRACT_END,value.USERID,value.CON_CREATE_DATE,value.COM_RATE,value.COMMENTS,value.CHARGEID,value.CHARGE_CREATE_DATE,value.CHARGE_START,value.CHARGE_END,value.GROUPS,value.GROUP_NAME,value.DEPT,value.DEPT_NAME,value.LOCATION,value.STORE_NAME,value.BRAND,value.UDA_DESC,value.ITEM,value.COMMISSION_TYPE,value.POSTING_CYCLE,value.MONTH,value.SALES_TARGET,value.OPT,value.RATE,value.MIN_GUARANTEED,value.ACTUAL_SALES,value.COLLECTION_DATE,value.POSTED_DATE,value.POSTED_STATUS,value.POSTING_AMT,value.DEAL_NO,value.COLLECT_START_DATE,value.RMS_STATUS,value.RMS_STATUS,value.GL_STATUS,value.REIM_STATUS]);
            });
            setTimeout($.loadingBlockHide, true);
          }
        })
    }else{
      toaster.pop("error", "", "Supplier and Posting Cycle must not be empty.", 2000, 'trustedHtml');
      setTimeout($.loadingBlockHide, true);
    } 
  }

});


