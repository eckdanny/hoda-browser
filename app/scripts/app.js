'use strict';

angular.module('hodaApp', [
  'ngRoute',
  'pasvaz.bindonce',
  'ngAnimate',
  'hoda.characters'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/character', {
        templateUrl: 'views/characters.html',
        controller: 'CharactersCtrl',
        resolve: {
          data: ['characters', function (characters) {
            return characters.get();
          }]
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  .controller('AppCtrl', function ($scope, $location) {

    $scope.links = [
      {
        path: '#/',
        name: 'Home',
        match: /^\/$/,
        active: false,
        order: 100
      },
      {
        path: '#/character',
        name: 'Characters',
        match: /^\/character(s?)/,
        active: false,
        order: 300
      }
    ];

    $scope.setActive = function () {
      $scope.links.some(function (link) {
        if (link.match.test($location.path())) {
          link.active = true;
        } else {
          link.active = false;
        }
      });
    };

    // Update
    $scope.$on('$routeChangeSuccess', function () {
      $scope.setActive();
    });
  })
