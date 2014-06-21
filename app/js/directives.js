'use strict';

/* Directives */

var directives = angular.module('fastTracks.directives', []);

directives.directive('lasttracks', function() {
    return {
        restrict: 'AE',
        templateUrl: 'partials/stream.html'
    };
});
