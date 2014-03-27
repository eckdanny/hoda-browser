'use strict';

angular.module('hodaApp')
  .factory('characterdata', function ($http) {

    /**
     * Fetches the character data
     * @return {Object} Promise
     */
    function get () {
      return $http.get('/data/characters.json');
    }

    // Public API here
    return {
      get: get
    };
  });
