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
            var SCDATA = {},
                limitClassnames = {'No limit': 'compact', 100: 'compact', 50: 'compact', 10: 'wide'};
//                limitClassnames = {'No limit': 'nolimit', '100': 100, '50': 50, '10': 10};

            scope.playlistOptions = [
                { label: 'My likes', value: 'favorites' },
                { label: 'My tracks', value: 'tracks' },
                { label: 'Stream', value: 'stream' }
            ];

            scope.limitOptions = [
                { label: 'No limit', value: Infinity},
                { label: '100', value: 100},
                { label: '50', value: 50 },
                { label: '10', value: 10 }
            ];

            scope.playlist = scope.playlistOptions[0];
            scope.maxTracks = scope.limitOptions[0];

            scope.$on('SCinitComplete', function (e, data) {
                SCDATA.me = data.data;
                if (scope.playlist.value === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (scope.playlist.value === 'tracks') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: 'nolimit', resolve: true, playlist: scope.playlist.value});
                } else if (scope.playlist.value === 'favorites') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: 'nolimit', playlist: scope.playlist.value});
                }
            });
            
            scope.setPlaylist = function() {
                scope.tracks = [];
                if (this.playlist.value === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (this.playlist.value === 'tracks') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: 'nolimit',  playlist: this.playlist.value});
                } else if (this.playlist.value === 'favorites') {
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: 'nolimit', playlist: this.playlist.value});
                }
            };

            scope.setLimit = function() {
                $rootScope.trackViewClass = limitClassnames[this.maxTracks.value];
//                scope.trackViewClass = limitClassnames[this.maxTracks];
                if (this.maxTracks.value === 10) {
//                    scope.tracks = [];
                    SoundCloud.getUserTracks(SCDATA.me.id, {limit: 10, resolve: true, playlist: scope.playlist.value});
                }
                console.log('trackViewClass class set to ' + $rootScope.trackViewClass);
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
                elt[0].querySelector('#connectBtn').addEventListener('click', function (e) {
                    SoundCloud.connect();
                });
            });

            scope.$on('connected', function (e, data) {
                scope.$evalAsync(function() {
                    scope.notConnected = false;
                });
            });

//            scope.$on('trackViewClass', function (e, trackViewClass) {
//                $rootScope.$evalAsync(function() {
//                    $rootScope.trackViewClass = trackViewClass;
////                    scope.trackViewClass = trackViewClass;
//                    console.log('trackViewClass class set to ' + trackViewClass);
//                });
//            });
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