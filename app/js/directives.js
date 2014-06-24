'use strict';

/* Directives */

var directives = angular.module('fastTracks.directives', []);

directives.directive('content', function (SoundCloud, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'partials/content.html',
        scope: {
            type: '@',  // Pass the type of tracks to retrieve
            limit: '@',  // Maximum number of tracks to retrieve
            resolve: '@'  // Maximum number of tracks to retrieve
        },
        link: function (scope, elt, attrs) {
            scope.tracks = [];
            scope.sound = undefined;
            scope.notConnected = false;
            scope.$on('SCinitComplete', function (e, data) {
                if (scope.type === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (scope.type === 'mytracks') {
                    SoundCloud.getMyTracks(data.data.id, {limit: scope.limit, resolve: scope.resolve});
                } else if (scope.type === 'myfavourites') {
                    SoundCloud.getMyFavourites(data.data.id, {limit: scope.limit, resolve: scope.resolve});
                }
            });

            scope.$on('streamComplete', function (e, data) {
                scope.tracks.push(data.data);
                scope.$apply();
            });

            scope.$on('trackResolved', function (e, data) {
                scope.tracks.push(data.data);
                scope.$apply();             // External change
            });

            scope.playTrack = function (track) {
                 SoundCloud.playStream(track.id).then(function(sound) {
                     scope.sound = sound;
//                     $rootScope.currentSound = sound;
//                     $rootScope.$apply();
                     console.log('got sound ' + sound);
                     scope.$emit('trackLoad', {track: track, sound: sound});
//                     scope.$apply();
                });

            };

//            scope.$on('alltracksretrieved', function (e, data) {
//                scope.tracks.push(data.data);
////                debugger;
//                scope.$apply();
//                console.log('display all favs');
//            });

            scope.$on('trackListing', function (e, data) {
                var results = [];

                results = data.data.filter(function(r) {
                    return r.id !== "undefined";
                });
//debugger;
                scope.tracks = scope.tracks.concat(results);

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
}).
    directive('player', function(SoundCloud) {
        return {
            restrict: 'AE',
            template: '<div class="player" ng-bind-html="track.oEmbed.html"></div>',
            link: function(scope, elem, attrs) {
                scope.$on('trackLoad', function (e, data) {
                    scope.track = data.track;
                    SoundCloud.embedTrack(data.track.permalink_url).then(function (oEmbed) {
                        scope.track.oEmbed = oEmbed;
                    });
                })
            }
        }
    });

//directives.directive('ngRepeatRange', function () {
//    return {
//        scope: { from: '=', to: '=', step: '=' },
//
//        link: function (scope, element, attrs) {
//
//            // returns an array with the range of numbers
//            // you can use _.range instead if you use underscore
//            function range(from, to, step) {
//                var array = [];
//                while (from + step <= to)
//                    array[array.length] = from += step;
//
//                return array;
//            }
//
//            // prepare range options
//            var from = scope.from || 0;
//            var step = scope.step || 1;
//            var to   = scope.to   || attrs['ngRepeatRange'];
//
//            // get range of numbers, convert to the string and add ng-repeat
//            var rangeString = range(from, to, step).join(',');
//            element.attr('ng-repeat', 'n in [' + rangeString + ']');
//            element.removeAttr('ngRepeatRange');
//        }
//    };
//});