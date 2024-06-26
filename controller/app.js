function pre_blocker(action){ 
    switch(action){   
    case "on":      
    $(".pre_blocker").show();   
    break;        
    case "off":       
    $(".pre_blocker").hide();     break;  
    }
}
var app = angular.module('joy', ['oitozero.ngSweetAlert','datatables', 'datatables.buttons','ui.bootstrap','ngRoute', 'ngAnimate', 'toaster','angularUtils.directives.dirPagination']);
app.config(['$routeProvider',
function ($routeProvider) {
    $routeProvider.
    when('/login', {
        title: 'Login Page',
        templateUrl: 'pages/login.html',
        controller: 'authCtrl'
    })
    .when('/dashboard', {
        title: 'Dashboard',
        templateUrl: 'pages/dashboard.html',
        controller: 'DashboardCtrl'
    })
    
    // User Management
    .when('/users', {
        title: 'User Management',
        templateUrl: 'user_pages/user.html',
        controller: 'UserCtrl'

    }).when('/new_user', {
        title: 'New User',
        templateUrl: 'user_pages/new_user.html',
        controller: 'AddUserCtrl'

    }).when('/edit_user/:id', {
        title: 'Edit User',
        templateUrl: 'user_pages/edit_user.html',
        controller: 'EditUserCtrl'

    }).when('/change_password/:uid/', {
        title: 'Change Password',
        templateUrl: 'user_pages/change_password.html',
        controller: 'ChangePassCtrl'

    }).when('/user_profile/:id', {
        title: 'User Profile',
        templateUrl: 'user_pages/profile.html',
        controller: 'ProfileCtrl'
    })

    // Attendance Management
    .when('/employee', {
        title: 'Attendance Management',
        templateUrl: 'attendance/employee.html',
        controller: 'EmployeeCtrl'
    })

    // Overtime Management
    .when('/overtime', {
        title: 'Overtime Management',
        templateUrl: 'overtime/overtime.html',
        controller: 'OvertimeCtrl'
    }).when('/otapproval', {
        title: 'Overtime Management',
        templateUrl: 'overtime/approval.html',
        controller: 'OvertimeCtrl'
    }).when('/otapproved', {
        title: 'Overtime Management',
        templateUrl: 'overtime/approved.html',
        controller: 'OvertimeCtrl'
    }).when('/otdisapproved', {
        title: 'Overtime Management',
        templateUrl: 'overtime/disapproved.html',
        controller: 'OvertimeCtrl'
    })

    // Leave Management
    .when('/leave', {
        title: 'Leave Management',
        templateUrl: 'leave/leave.html',
        controller: 'LeaveCtrl'
    })

    // Time Entry Management
    .when('/timeEntry', {
        title: 'Time Entry Management',
        templateUrl: 'timeentry/timeentry.html',
        controller: 'TimeEnrtyCtrl'
    })

    // Schedule Management
    .when('/schedule', {
        title: 'Category Management',
        templateUrl: 'schedule/schedule.html',
        controller: 'ScheduleCtrl'

    })

     // Settings Management
    .when('/settings', {
        title: 'Settings Management',
        templateUrl: 'settings/settings.html',
        controller: 'SettingsCtrl'     
    })
   
    .when('/', {
        title: 'Login Page',
        templateUrl: 'pages/login.html',
        controller: 'authCtrl',
        role: '0'
    })
    .otherwise({
        redirectTo: '/login'
    });
}]).run(function ($rootScope, $location, Data) {
  $rootScope.$on("$routeChangeStart", function (event, next, current) 
  {
      $rootScope.authenticated = false;
      Data.get('session').then(function (results) 
      {
          if (results.uid) 
          {
            $rootScope.authenticated = true;
            $rootScope.uid = results.uid;
            $rootScope.role = results.role;
            $rootScope.usertype_name = results.usertype_name;
            $rootScope.name = results.name;
          } else {
              var nextUrl = next.$$route.originalPath;
              if (nextUrl == '/login' || nextUrl == '/signup')
              {

              } else 
              {
                  $location.path("/login");
                  pre_blocker('off');
              }
          }
      });
  });
});

app.controller('authCtrl', function ($scope, $rootScope, $routeParams, $location, $http, Data) {
  $scope.login = {};
  $scope.doLogin = function (customer) {
    Data.post('login', {customer: customer}).then(function (results) {
      Data.toast(results);
      if (results.status == "success") {
          $location.path('dashboard');
      }
    });
  };
});


app.controller('DashboardCtrl', function($scope, Data, $location) {
  Data.get('getCntEmployees').then(function (results) {
    $scope.users = results;
  });
  Data.get('getCntAttendance').then(function (results) {
    console.log(results);
    $scope.attendance = results;
  });
  Data.get('getCntItems').then(function (results) {
    $scope.items = results;
  });
  $scope.logout = function () {
      Data.get('logout').then(function (results) {
          Data.toast(results);
          $location.path('login');
      });
  }
});
