'use strict';

angular.module('hodaApp')

  .filter('startFrom', function () {
    return function (input, start) {
      start = +start;
      return input.slice(start);
    }
  })

  .filter('speedToText', function() {
    var map = {
      1: 'Slow',
      2: 'Medium',
      3: 'Quick'
    };
    return function (input) {
      var out;
      input = input || '';
      out = (!map[input])
          ? ''
          : map[input]
          ;
      return out;
    };
  })

  .controller('CharactersCtrl', function ($scope, data) {

    $scope.charactersFiltered;

    $scope.characters = data.data;

    $scope.predicate = 'name';

    $scope.showNum = 15;

    $scope.currentPage = 0;

    $scope.numberOfPages = function () {
      return   $scope.charactersFiltered
             ? Math.ceil($scope.charactersFiltered.length/$scope.showNum)
             : 0;
    };

    $scope.advance = function () {
      if ($scope.currentPage < $scope.numberOfPages() - 1) {
        $scope.currentPage = $scope.currentPage + 1;
      }
    };

    $scope.retreat = function () {
      if (0 < $scope.currentPage) {
        $scope.currentPage = $scope.currentPage - 1;
      }
    };

    $scope.search = {};

    $scope.myListFilter = {
      inList: true
    };

    $scope.activeFilter = $scope.search;

    $scope.setActiveFilter = function (filter) {
      if ($scope[filter]) {
        $scope.activeFilter = $scope[filter];
      }
    }

    $scope.getPower = function (level, character, tier) {

      tier--;

      level = (level > character.maxLevel[tier])
            ? character.maxLevel[tier]
            : level
            ;

      return character.basePower[tier] + character.delPower[tier] * (level - 1);
    }

    $scope.getHealth = function (level, character, tier) {
      tier--;

      level = (level > character.maxLevel[tier])
            ? character.maxLevel[tier]
            : level
            ;

      return character.baseHealth[tier] + character.delHealth[tier] * (level--);
    }

  });


// @todo: Fix pagination
//  - remember state going from all > collection > all
//  - Going from 15/pg to 100/pg ==> now showing 11/2
