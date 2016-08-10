var app = angular.module("app", ['ngSanitize', 'ngCsv', 'ngAnimate', 'ui.bootstrap']);

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
    $scope.isRunning = false;
    $scope.isPackagesCollapsed = true;
    $scope.isFormCollapsed = false;

    $scope.tableHeader = ['Input', 'Match', 'Score', 'Accept'];

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
        $scope.isRunning = true;
        $scope.isFormCollapsed = true;
        var status_url = headers('Location');
        $scope.taskID = headers('TaskID');
        $scope.status_text = 'Loading...';
        $scope.dataframe = []; // reset dataframe
        console.log(status_url);
        (function tick() {
          $scope.data = $http({
            method: 'GET',
            url: status_url
          }).success(function (data) {
            if (data.state == "REVOKED") {
              $scope.status_text = 'Process stopped.';
              $scope.isRunning = false;
            } else if (data.state == "PENDING") {
              // skip scope update but continue polling if status comes back as pending
              // FIXME: known issue on some servers, status update comes back as PENDING even though process is running
              $timeout(tick, 1000);
            } else if (data.state != "SUCCESS") {
              //$scope.status_text = 'Loading... ' + data.current + ' of ' + data.total;
              $scope.progressCurrent = data.current;
              $scope.progressTotal = data.total;
              //$scope.dataframe = data.status; // disabled mid-processing results
              $timeout(tick, 1000);
            } else {
              $scope.status_text = 'Loading complete: ' + data.current + ' of ' + data.total;
              $scope.dataframe = data.result;
              $scope.isRunning = false;
            }
          });
        })();
      });
    };

    app.stopMatch = function() {
      $http({
        method: 'GET',
        url: '/match_kill/' + $scope.taskID
      }).success(function (data) {

      });
    };

    // Partially adapted from http://ng-table.com/#/editing/demo-inline
    // TODO: allow undo of edit via cancel button
    app.resetRow = function (row, rowForm) {
      row.isEditing = false;
      rowForm.$setPristine();
    };

    app.save = function (row, rowForm) {
      app.resetRow(row, rowForm);
    };


  }]);

