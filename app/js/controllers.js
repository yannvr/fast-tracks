'use strict';

/* Controllers */

angular.module('fastTracks.controllers', [])
  .controller('SCCtrl', ['SoundCloud', '$scope', function(SoundCloud, $scope) {
        SoundCloud.startApp();
        $scope.addTrack = function(trackUrl) {
            SoundCloud.embedTrack(trackUrl);
        };
        $scope.SCData = SoundCloud.SCData;
  }]);
