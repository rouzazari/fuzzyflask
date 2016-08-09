var app = angular.module("app", []);

app.config(['$interpolateProvider', function ($interpolateProvider) {
  // change the delimiter for AngularJS to avoid conflicts with Jinja2
  // source:
  // http://stackoverflow.com/questions/30362950
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);


app.controller("AppCtrl", ['$scope', '$http', '$httpParamSerializerJQLike', '$timeout',
  function ($scope, $http, $httpParamSerializerJQLike, $timeout) {
    // use $httpParamSerializerJQLike to make params for POST
    // source: https://docs.angularjs.org/api/ng/service/$httpParamSerializerJQLike
    var app = this;

    app.sendData = function () {
      // save dictionary to variables
      $scope.dictionary = $scope.form.dictionary.split("\n");
      // POST to server with content of two textareas
      // Status URL is retrieved on success, beginning the polling process
      $http({
        method: 'POST',
        url: '/match_async',
        data: $httpParamSerializerJQLike($scope.form),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function (data, status, headers) {
        // TODO: Hide input area after clicking, add button show input area again
        // TODO: Make this less imperative and more declarative (AngularJS),
        // TODO: consider using ng-table
        var status_url = headers('Location');
        $scope.status_text = 'Loading...';
        $scope.dataframe = []; // reset dataframe
        (function tick() {
          $scope.data = $http({
            method: 'GET',
            url: status_url
          }).success(function (data) {
            if (data.state != "SUCCESS") {
              console.log("Still working...");
              $scope.status_text = 'Loading... ' + data.current + ' of ' + data.total;
              //$scope.dataframe = data.status; // disabled mid-processing results
              $timeout(tick, 1000);
            } else {
              console.log("Complete...");
              $scope.status_text = 'Loading complete: ' + data.current + ' of ' + data.total;
              $scope.dataframe = data.result;
              console.log(data.result)
            }
          });
        })();
      });
    };

    // TODO: set row state (pristine/dirty) and tracking (track/untrack)
    app.resetRow = function (row, rowForm) {
      row.isEditing = false;
    };

    app.save = function (row, rowForm) {
      app.resetRow(row, rowForm);
    };



  }]);
