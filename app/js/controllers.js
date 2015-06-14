'use strict';

/* Controllers */

angular.module('fastTracks.controllers', ['pasvaz.bindonce'])
  .controller('FastTrackController', function(SoundCloud, $scope, $rootScope, $http) {

        var accessToken = window.location.hash.split('&')[0].split('=')[1];
        if (accessToken) {
            localforage.setItem('accessToken', accessToken).then(function() { window.close() });
        }

        SoundCloud.startApp();

        localforage.getItem('accessToken').then(function (token) {
            if (token) {
                $rootScope.connected = true;
                var url = 'https://api.soundcloud.com/me.json?oauth_token=' + token;
                $http({method: 'GET', url: url}).
                    success(function (data, status, headers, config) {
                        SoundCloud.SCData.me = data;
                        $rootScope.$broadcast('SCinitComplete', {data: data});
                    }).
                    error(function (data, status, headers, config) {
                        console.error("failed to get: " + url)
                    });
            }
        });

  });
