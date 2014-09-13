'use strict';

/* Directives */

//TODO Fix player madness :)
// Do Loader

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
            scope.trackViewClass = 'wide';
            var playListName = scope.playlist.value;

            scope.$on('SCinitComplete', function (e, data) {
                var resolve = false;
                SoundCloud.SCData.me = data.data;
                if (playListName === 'stream') {        //TODO: Medium view
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    })
                } else if (playListName === 'tracks') {
                    if (SoundCloud.SCData.me.public_favorites_count <= 10) {
                        resolve = true;
                    }
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', resolve: resolve, playlist: playListName});
                } else if (playListName === 'favorites') {
                    if (SoundCloud.SCData.me.track_count <= 10) {
                        resolve = true;
                    }
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', resolve: resolve, playlist: playListName});
                }
            });

            scope.refresh = function () {
                scope.playlistTracks[playListName] = [];
                setTrackViewClass();
            };

            scope.isCurrentPlaylist = function(playlist) {
                return playListName === playlist;
            };

            scope.setPlaylist = function () {
                playListName = this.playlist.value;

                setTrackViewClass(playListName);
                if (!scope.playlistTracks[playListName]) {
                    scope.playlistTracks[playListName] = [];
                } else if (scope.playlistTracks[playListName].length > 0) {
                    return true;
                }

                if (this.playlist.value === 'stream') {
                    SoundCloud.getAllFollowings().then(function () {
                        SoundCloud.getLastFollowingsTracks();
                    });
                } else if (this.playlist.value === 'tracks') {
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', playlist: this.playlist.value});
                } else if (this.playlist.value === 'favorites') {
                    SoundCloud.getUserTracks(SoundCloud.SCData.me.id, {limit: 'nolimit', playlist: this.playlist.value});
                }
            };

            function setTrackViewClass(playListName) {
                $rootScope.trackViewClass = '';

                if (playListName == 'stream') {
                    $rootScope.trackViewClass = 'wide vertical';
                } else if (playListName === 'favorites' && SoundCloud.SCData.me && SoundCloud.SCData.me.public_favorites_count <= 10 ||
                    playListName === 'tracks' && SoundCloud.SCData.me && SoundCloud.SCData.me.track_count <= 10 ||
                    scope.playlistTracks[playListName] && scope.playlistTracks[playListName].length && scope.playlistTracks[playListName].length <= 10) {
                    $rootScope.trackViewClass = 'wide';
                } else {
                    $rootScope.trackViewClass = 'compact';
                }
            }

            scope.$on('streamTracksCollected', function (e, tracks) {
                scope.$evalAsync(function () {
                    scope.playlistTracks[playListName] = scope.playlistTracks[playListName].concat(tracks);
                });
            });

            scope.$on('trackResolved', function (e, track) {
                scope.$evalAsync(function () {
                    scope.playlistTracks[playListName] = scope.playlistTracks[playListName].concat(track);
                });
            });

            scope.playTrack = function (track) {
                SoundCloud.playStream(track.id).then(function (sound) {
                    scope.sound = sound;
                    console.log('got sound ' + sound);
                    scope.$emit('trackLoad', {track: track, sound: sound});
                });
            };

            scope.$on('trackListing', function (e, tracks) {

                scope.$evalAsync(function () {
                    scope.playlistTracks[playListName] = scope.playlistTracks[playListName].concat(tracks);
                });
            });

            scope.$on('notConnected', function (e, data) {
                scope.notConnected = true;
                scope.$apply();
                elt[0].querySelector('#connectBtn').addEventListener('click', function (e) {
                    SoundCloud.connect();
                });
            });

            scope.$on('connected', function (e, data) {
                scope.$evalAsync(function () {
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
    directive('player', function (SoundCloud) {
        return {
            restrict: 'AE',
            template: '<div class="player" ng-bind-html="track.oEmbed.html"></div>',
            link: function (scope, elem, attrs) {
                scope.$on('trackLoad', function (e, data) {
                    scope.track = data.track;
                    SoundCloud.getEmbed(data.track, { auto_play: false, comments: false, maxheight: 120  }).then(function (oEmbed) {
                        scope.track.oEmbed = oEmbed;
                    });
                })
            }
        }
    });