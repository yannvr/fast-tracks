'use strict';

/* SoundCloud Services */

var SCService = angular.module('fastTracks.services', []).
    constant('SCAppConfig', {CLIENT_ID: '658e6daa1a76c7f3cb7f0b495a6830db',
        REDIRECT_URI: 'http://2.221.195.103/home.html'});
//  value('version', '0.1').

SCService.factory('SoundCloud', ['$http', '$rootScope', '$q', '$sce', 'SCAppConfig', function ($http, $rootScope, $q, $sce, SCAppConfig) {

    var SCData = {followings: [], followingsTracks: []},
        that = this,
        indexs = {favorite: {page: 0, track: 0},
            followings: {page: 0, nb: 0, i: 0, tracksRequested: []},
            track: {page: 0, track: 0}},
        TodayFollowerTracksFilter = function () {
            SCData['TodayFollowerTracksFilter'].tracks.filter(function (track) {
                return track
            });
        };

    this.startApp = function () {
        this.init();
        localforage.getItem('accessToken', function (token) {

            if (!token) {
                $rootScope.$broadcast('notConnected');
            } else {
                $rootScope.$broadcast('connected');
                var url = 'https://api.soundcloud.com/me.json?oauth_token=' + token;
                $http({method: 'GET', url: url}).
                    success(function (data, status, headers, config) {
                        SCData.me = data;
                        $rootScope.$broadcast('SCinitComplete', {data: data});
//                        that.getAllFollowings().then(function () {
//                            that.getLastFollowingsTracks();
//                        })
                    }).
                    error(function (data, status, headers, config) {
                        console.error("failed to get: " + url)
                    });
            }
        });
    };

    this.init = function () {
        SC.initialize({
            client_id: SCAppConfig.CLIENT_ID,
            redirect_uri: SCAppConfig.REDIRECT_URI
        });
    };

    /**
     * @desc: Get the tracks (limitPerUser) released by the followings in the last 24 hours
     */
    this.getLastFollowingsTracks = function () {

//        https://console.developers.google.com/project?getstarted=https:%2F%2Fcloud.google.com&_ga=1.68338001.1789426036.1402827593

        var fromDate = moment().subtract('days', 1).toISOString(),
            toDate = new Date(Date.now()).toISOString();
        if (!SCData.followings) {
            SCData.followingsTracks = [];
            that.getFollowings().
                then(function (results) {
                    SCData.followings = results;

                    SCData.followings.forEach(function (following) {
                        var url = '/users/' + following.id + '/tracks';

                        SC.get(url, { 'created_at[from]': fromDate, 'created_at[to]': toDate}, function (response) {

                            if (response.length) {
                                SCData.followingsTracks = SCData.followingsTracks.concat(response);
                                console.log(following.username + ' got ' + response.length + ' tracks');
                            }
                        });
                    })

                });
            return SCData.followingsTracks;
        } else {
            SCData.followings.forEach(function (following) {
                if (indexs.followings.tracksRequested.indexOf(following.id) === -1) {
                    var url = '/users/' + following.id + '/tracks';
                    SC.get(url, { 'created_at[from]': fromDate, 'created_at[to]': toDate}, function (response) {
                        if (response.length) {
                            console.log(following.username + ' got ' + response.length + ' tracks');
                            response.forEach(function (track, i) {
                                SC.oEmbed(track.permalink_url, { auto_play: false }, function (oEmbed) {

                                    track.oEmbed = oEmbed;
                                    track.oEmbed.html = $sce.trustAsHtml(oEmbed.html);
                                    if (i === response.length - 1) {
                                        SCData.followingsTracks = SCData.followingsTracks.concat(track);
                                        $rootScope.$broadcast('streamComplete', {data: track});
                                    }
                                });
                            });
                        }
                    });
                    indexs.followings.tracksRequested.push(following.id);
                }
            })
        }
    };


    this.getMyTracks = function (UserId, limit) {
        var deferred = $q.defer();

        limit = limit || 100;
        var url = '/users/' + UserId + '/tracks';
        SC.get(url, {limit: limit}, function (response) {
            if (response.error) {
                deferred.reject(new Error(response));
            } else {
                response.forEach(function(mytrack) {
                    SC.oEmbed(mytrack.permalink_url, { auto_play: false }, function (oEmbed) {
                        mytrack.oEmbed = oEmbed;
                        mytrack.oEmbed.html = $sce.trustAsHtml(oEmbed.html);
                        $rootScope.$broadcast('mytracksresolved', {data: mytrack});

                    });

                });
            }
        });

        return deferred.promise;
    };

    this.getMyFavourites = function (UserId, limit) {
        var deferred = $q.defer();

        limit = limit || 100;
        var url = '/users/' + UserId + '/favorites';
        SC.get(url, {limit: limit}, function (response) {
            if (response.error) {
                deferred.reject(new Error(response));
            } else {
//                debugger;
                response.forEach(function(mytrack) {
                    SC.oEmbed(mytrack.permalink_url, { auto_play: false }, function (oEmbed) {
                        mytrack.oEmbed = oEmbed;
                        mytrack.oEmbed.html = $sce.trustAsHtml(oEmbed.html);
                        $rootScope.$broadcast('myfavouritesresolved', {data: mytrack});

                    });

                });
            }
        });

        return deferred.promise;
    };

    this.getFollowings = function () {
        var deferred = $q.defer();

        var url = '/users/' + SCData.me.id + '/followings/';

        SC.get(url, {limit: 200, offset: indexs.followings.nb}, function (response) {

            if (response.error) {
                deferred.reject(new Error(response));
            } else {
                deferred.resolve(response)
            }
        });

        return deferred.promise;

    };

    this.getAllFollowings = function () {
        var deferred = $q.defer();

        this.getFollowings().then(function (results) {
            indexs.followings.nb += results.length;

            if (results) {
                SCData.followings = SCData.followings.concat(results);
            }

            deferred.resolve(SCData.followings);

            if (indexs.followings.nb !== SCData.me.followings_count) {
                that.getAllFollowings().then(function () {
                    that.getLastFollowingsTracks();
                })
            }

        });


        return deferred.promise;
    };

    this.connect = function () {
        SC.connect(function () {
            SC.get('/me', function (me) {
                alert('Hello, ' + me.username);
            });
        });
    };

    /**
     * @desc embedds track. Parameters http://developers.soundcloud.com/docs/api/reference#oembed
     * @param track_url
     */
    this.embedTrack = function (track_url) {
        SC.oEmbed(track_url, { auto_play: false }, function (oEmbed) {
            return oEmbed;
        });
    };

    this.SCData = SCData;

    return this;
}]);