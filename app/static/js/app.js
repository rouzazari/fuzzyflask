var app = angular.module("app", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
  // change the delimiter for AngularJS to avoid conflicts with Jinja2
  // source:
  // http://stackoverflow.com/questions/30362950
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);


app.controller("AppCtrl", ['$scope', '$http', '$httpParamSerializerJQLike', function($scope, $http, $httpParamSerializerJQLike) {
  // use $httpParamSerializerJQLike to make params for POST
  // source: https://docs.angularjs.org/api/ng/service/$httpParamSerializerJQLike
  var app = this;

  app.sendData = function() {
    // simple function that prints "Hello, <name>!" to helloStatement
    $http({
      method  : 'POST',
      url     : '/match_async',
      data    : $httpParamSerializerJQLike($scope.form),
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function (data, status, headers) {
        // TODO: Hide input area after clicking
        var status_url = headers('Location');
        $scope.status_url = status_url;
        $scope.dataframe = data;
    });


  }

}]);
