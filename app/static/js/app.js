var app = angular.module("app", ['ngSanitize', 'ngCsv', 'ngAnimate', 'ui.bootstrap']);

app.config(['$interpolateProvider', function ($interpolateProvider) {
  // change the delimiter for AngularJS to avoid conflicts with Jinja2
  // source:
  // http://stackoverflow.com/questions/30362950
  $interpolateProvider.startSymbol('{a');
  $interpolateProvider.endSymbol('a}');
}]);


app.controller("AppCtrl", ['$scope', '$http', '$httpParamSerializerJQLike', '$timeout', '$uibModal',
  function ($scope, $http, $httpParamSerializerJQLike, $timeout, $uibModal) {
    // use $httpParamSerializerJQLike to make params for POST
    // source: https://docs.angularjs.org/api/ng/service/$httpParamSerializerJQLike
    var app = this;

    app.resetForm = function() {
      $scope.isRunning = false;
      $scope.isFormCollapsed = false;
      $scope.dataframe = [];
    };


    app.resetForm();
    $scope.isPackagesCollapsed = true;


    $scope.tableHeader = ['Input', 'Match', 'Score', 'Accept'];

    app.openErrorModal = function (modalErrorMessage) {
      $scope.modalErrorMessage = modalErrorMessage;
      $uibModal.open({
        templateUrl: 'notificationModal.html',
        controller: 'ModalInstanceCtrl',
        size: 'sm',
        scope: $scope
      });
    };

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
      }).then(
        function pollStatus(response) {
          // set request/UI status
          $scope.isRunning = true;
          $scope.isFormCollapsed = true;

          // get status url for updates
          var status_url = response.headers('Location');
          $scope.taskID = response.headers('TaskID');
          $scope.dataframe = []; // reset data frame

          // polling for status update (JSON response)
          (function pollTick() {
            $http({
              method: 'GET',
              url: status_url
            }).then(
              function successCallback(response) {
                if (response.data.state == "REVOKED") {
                  // if revoked, the process was stopped by user.
                  app.openErrorModal('Process stopped.');
                  $scope.isRunning = false;

                } else if (response.data.state == "PENDING") {
                  // skip scope update but continue polling if status comes back as pending
                  $timeout(pollTick, 2000);

                } else if (response.data.state != "SUCCESS") {
                  // the task is still running, continue polling.
                  $scope.progressCurrent = response.data.current;
                  $scope.progressTotal = response.data.total;
                  $timeout(pollTick, 1000);

                } else {
                  // the task is complete (i.e. response.data.state == "SUCCESS")
                  $scope.dataframe = response.data.result;
                  $scope.isRunning = false;

                }
            },function errorCallback() {
                app.resetForm();
                app.openErrorModal('Unable to retrieve results from server.');
              });
          })();
      }, function errorCallback() {
          // error sending data to server, error out.
          app.resetForm();
          app.openErrorModal('Error sending data to server.');
      });
    };


    app.stopMatch = function() {
      $http({
        method: 'GET',
        url: '/match_kill/' + $scope.taskID
      }).then(
        function successCallback() {

      }, function errorCallback() {
        app.openErrorModal('Unable to stop. Trouble communicating with server.')
      });

      app.resetForm();
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

// adapted from https://github.com/angular-ui/bootstrap/tree/master/src/modal
app.controller("ModalInstanceCtrl", ['$scope', '$uibModalInstance',
  function ($scope, $uibModalInstance, message) {
    $scope.message = message;
    $scope.ok = function () {
      $uibModalInstance.close()
    };
    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);