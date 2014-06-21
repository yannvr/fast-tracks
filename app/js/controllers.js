'use strict';

/* Controllers */

angular.module('fastTracks.controllers', [])
  .controller('SCCtrl', function(SoundCloud, $scope) {
        SoundCloud.startApp();
        $scope.SCData = SoundCloud.SCData;
  });
