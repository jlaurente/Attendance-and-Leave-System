app.controller('navCtrl', ['$scope', '$location', function ($scope, $location) {
  $scope.navClass = function (page) {
    var hash = $location.path().substring(1);
        hash =  0 ? 'dashboard' : hash;

    return page === hash ? 'active' : '';
  };
}]);