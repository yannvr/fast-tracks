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
            var SCDATA = {};

            scope.options = [
                { label: 'My likes', value: 'favorites' },
                { label: 'My tracks', value: 'tracks' },
                { label: 'Stream', value: 'stream' }
            ];

            scope.category = scope.options[1];

            scope.$on('SCinitComplete', function (e, data) {
                SCDATA.me = data.data;
                if (scope.category.value === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (scope.category.value === 'tracks') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: scope.limit, resolve: 'true', category: scope.category.value});
                } else if (scope.category.value === 'favorites') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: scope.limit, resolve: 'false', category: scope.category.value});
                }
            });
            
            scope.selectAction = function() {
    //                scope.category = this.category.value;
    //                scope.type = this.category.value;
                scope.tracks = [];
                if (this.category.value === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (this.category.value === 'tracks') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: 'nolimit', resolve: 'false', category: this.category.value});
                } else if (this.category.value === 'favorites') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: scope.limit, resolve: 'false', category: this.category.value});
                }
                console.log('select cate: ' +  this.category);
            };

            scope.$on('streamComplete', function (e, data) {
                scope.$evalAsync(function() {
                    scope.tracks.push(data.data);
                });
            });

            scope.$on('trackResolved', function (e, track) {
                scope.$evalAsync(function() {
                    scope.tracks.push(track);
                });
            });

            scope.playTrack = function (track) {
                 SoundCloud.playStream(track.id).then(function(sound) {
                     scope.sound = sound;
                     console.log('got sound ' + sound);
                     scope.$emit('trackLoad', {track: track, sound: sound});
                });
            };

            scope.$on('trackListing', function (e, tracks) {
                scope.$evalAsync(function() {
                    scope.tracks = scope.tracks.concat(tracks);
                });
            });

            scope.$on('notConnected', function(e, data) {
                scope.notConnected = true;
                scope.$apply();
                elt[0].querySelector('#connectBtn').addEventListener('click', function(e) {
                SoundCloud.connect();
                });
            });

            scope.$on('connected', function (e, data) {
                scope.$evalAsync(function() {
                    scope.notConnected = false;
                });
            });

            scope.$on('trackViewClass', function (e, trackViewClass) {
                $rootScope.$evalAsync(function() {
                    $rootScope.trackViewClass = trackViewClass;
                    scope.trackViewClass = trackViewClass;
                    console.log('trackViewClass class set to ' + trackViewClass);
                });
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
                    SoundCloud.getEmbed(data.track, { auto_play: false, comments:false, maxheight: 120  }).then(function (oEmbed) {
                        scope.track.oEmbed = oEmbed;
                    });
                })
            }
        }
    });