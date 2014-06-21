'use strict';

/* Directives */

var directives = angular.module('fastTracks.directives', []);

directives.directive('stream', function (SoundCloud) {
    return {
        restrict: 'AE',
        templateUrl: 'partials/stream.html',
        link: function(scope, elt, attrs) {
            scope.lastTracks = [];
            scope.$on('SCinitComplete', function() {
                    SoundCloud.getAllFollowings().then(function () {
                    SoundCloud.getLastFollowingsTracks();
                })
            });

            scope.$on('streamComplete', function(e, data) {
                scope.lastTracks.push(data.data);
            });
        }

//        controller: function (SoundCloud, $scope) {
//            $.on('SCinitComplete', function() {
//                SoundCloud.getAllFollowings().then(function () {
//                    SoundCloud.getLastFollowingsTracks();
//                })
//            });
//
//        }
    };
});

directives.directive('mytracks', function (SoundCloud) {
    return {
        restrict: 'AE',
        templateUrl: 'partials/mytracks.html',
        link: function(scope, elt, attrs) {
            scope.mytracks = [];
            scope.$on('SCinitComplete', function(e, data) {
                SoundCloud.getUserTracks(data.data.id);
            });

            scope.$on('mytracksresolved', function(e, data) {
                scope.mytracks.push(data.data);
                scope.$apply();             //TODO: Well..
            });
        }
    };
});
