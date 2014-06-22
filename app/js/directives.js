'use strict';

/* Directives */

var directives = angular.module('fastTracks.directives', []);

directives.directive('content', function (SoundCloud) {
    return {
        restrict: 'E',
        templateUrl: 'partials/content.html',
        scope: {
            type: '@',  // Pass the type of tracks to retrieve
            limit: '@'  // Maximum number of tracks to retrieve
        },
        link: function (scope, elt, attrs) {
            scope.tracks = [];
            scope.notConnected = false;
            scope.$on('SCinitComplete', function (e, data) {
                if (scope.type === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (scope.type === 'mytracks') {
                    SoundCloud.getMyTracks(data.data.id, scope.limit);
                } else if (scope.type === 'myfavourites') {
                    SoundCloud.getMyFavourites(data.data.id, scope.limit);
                }
            });

            scope.$on('streamComplete', function (e, data) {
                scope.tracks.push(data.data);
                scope.$apply();
            });

            scope.$on('mytracksresolved', function (e, data) {
                scope.tracks.push(data.data);
                scope.$apply();             // External change
            });

            scope.$on('myfavouritesresolved', function (e, data) {
                scope.tracks.push(data.data);
                scope.$apply();
            });

            scope.$on('notConnected', function(e, data) {
                scope.notConnected = true;
                scope.$apply();
                elt[0].querySelector('#connectBtn').addEventListener('click', function(e) {
                SoundCloud.connect();
                });
            });

            scope.$on('connected', function (e, data) {
                scope.notConnected = false;
                scope.$apply();
            });
        }

    }
});