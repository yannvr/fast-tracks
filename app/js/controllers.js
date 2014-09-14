'use strict';

/* Controllers */

angular.module('fastTracks.controllers', ['pasvaz.bindonce'])
  .controller('SCCtrl', function(SoundCloud, $scope) {
        SoundCloud.startApp();
        $scope.SCData = SoundCloud.SCData;
  });
