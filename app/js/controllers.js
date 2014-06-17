'use strict';

/* Controllers */

angular.module('fastTracks.controllers', [])
  .controller('SCCtrl', ['SoundCloud', '$scope', function(SoundCloud, $scope) {
        SoundCloud.startApp();
        $scope.addTrack = function(trackUrl) {
            debugger;
            SoundCloud.embedTrack(trackUrl);
//            debugger;
        };
        $scope.SCData = SoundCloud.SCData;
//        $scope.apply();
        $scope.test = {test: 43+'XXx', subtest: {val: 32}};
  }]);
//  .controller('MyCtrl2', ['$scope', function($scope) {
//
//  }]);
