'use strict';

angular.module('hodaApp')

  .filter('startFrom', function () {
    return function (input, start) {
      start = +start;
      return input.slice(start);
    }
  })

  .controller('CharactersCtrl', function ($scope, data) {

    $scope.characters = data;

    //
    // Search & Filters
    //

    $scope.search = {};
    $scope.predicate = 'name';


    $scope.myListFilter = {
      inList: true
    };

    $scope.activeFilter = $scope.search;

    $scope.setActiveFilter = function (filter) {
      if ($scope[filter]) {
        $scope.activeFilter = $scope[filter];
      }
    };

    //
    // @todo(deck0): move pagination stuff into seperate module
    //

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
  });


// @todo: Fix pagination
//  - remember state going from all > collection > all
//  - Going from 15/pg to 100/pg ==> now showing 11/2
