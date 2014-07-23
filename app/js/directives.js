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
            scope.playlistTracks = {favorites: [], tracks: [], stream: []};
            scope.sound = undefined;
            scope.notConnected = false;

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

            scope.playlist = scope.playlistOptions[1];
            scope.maxTracks = scope.limitOptions[0];

            scope.$on('SCinitComplete', function (e, data) {
                var resolve = false;
                SoundCloud.SCData.me = data.data;
                if (scope.playlist.value === 'stream') {        //TODO: Medium view
                    SoundCloud.getAllFollowings().then(function () {
                         SoundCloud.getLastFollowingsTracks();
                    })
                } else if (scope.playlist.value === 'tracks') {
                    if (SoundCloud.SCData.me.public_favorites_count <= 10) {
                        resolve = true;
                    }
                     SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', resolve: resolve, playlist: scope.playlist.value});
                } else if (scope.playlist.value === 'favorites') {
                    if (SoundCloud.SCData.me.track_count <= 10) {
                        resolve = true;
                    }
                     SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', resolve: resolve, playlist: scope.playlist.value});
                }
            });

            scope.refresh = function () {
                scope.playlistTracks[scope.playlist] = [];
            };

            scope.setPlaylist = function () {
                scope.playlist.value = this.playlist.value;

                if (!scope.playlistTracks[scope.playlist.value]) {
                    scope.playlistTracks[scope.playlist.value] = [];
                } else if (scope.playlistTracks[scope.playlist.value].length > 0) {
//                    scope.$apply(function() {
//                        scope.tracks = scope.playlistTracks[scope.playlist.value];
//                    });

                    return true;
                }

                if (this.playlist.value === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (this.playlist.value === 'tracks') {
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', playlist: this.playlist.value});
                } else if (this.playlist.value === 'favorites') {
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', playlist: this.playlist.value});
                }
            };

/*            scope.setLimit = function() {
                $rootScope.trackViewClass = limitClassnames[this.maxTracks.value];
                if (this.maxTracks.value === 10) {
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 10, resolve: true, playlist: scope.playlist.value});
                }
                console.log('trackViewClass class set to ' + $rootScope.trackViewClass);
            };*/

//            scope.$watch('playlistTracks[playlist.value]', function () {
//                console.log("NB Tracks: " + scope.playlistTracks[scope.playlist.value].length + ' on: ' + scope.playlist.value);
//            });

            scope.$watch('playlist.value', function () {

                if(scope.playlist.value === 'favorites' && SoundCloud.SCData.me && SoundCloud.SCData.me.public_favorites_count <= 10 ||
                    scope.playlist.value === 'tracks' && SoundCloud.SCData.me && SoundCloud.SCData.me.track_count <= 10 ||
                    scope.playlistTracks[scope.playlist.value].length <= 10) {
                    $rootScope.trackViewClass = 'wide';
                } else {
                    $rootScope.trackViewClass = 'compact';
                }
            });

            scope.$on('streamTracksCollected', function (e, tracks) {

                scope.$evalAsync(function() {
                    scope.playlistTracks[scope.playlist.value] = scope.playlistTracks[scope.playlist.value].concat(tracks);
                });
            });

            scope.$on('trackResolved', function (e, track) {
//                scope.playlistTracks[scope.playlist.value].push(track);

                scope.$evalAsync(function() {
                    scope.playlistTracks[scope.playlist.value] = scope.playlistTracks[scope.playlist.value].concat(track);
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
                    scope.playlistTracks[scope.playlist.value] = scope.playlistTracks[scope.playlist.value].concat(tracks);
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