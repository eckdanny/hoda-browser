(function () { 'use strict';

  angular.module('hoda.characters', [])

    .filter('speedToText', function() {
      var map = {
        1: 'Slow',
        2: 'Medium',
        3: 'Quick'
      };
      return function (input) {
        input = input || '';
        return (!map[input]) ? '' : map[input];
      };
    })

    .factory('characters', function ($http, $q, characterFactory) {

      var _data;

      /**
       * Fetches the character data
       * @return {Object} Promise
       */
      function get () {

        var d = $q.defer();

        if (_data) {
          return _data;
        } else {
          $http.get('/data/characters.json')
          .then(function (res) {
            _data = [];
            for (var i in res.data) {
              _data.push(characterFactory.create(res.data[i]));
            }
            d.resolve(_data);
          }, d.reject);
        }

        return d.promise;
      }

      // Public API here
      return {
        get: get
      };
    })

    .factory('characterFactory', function (characterBehaviors) {
      /**
       * Character constructor function
       * @param {Object} data Character data
       * @constructor
       * @return {Object}
       */
      function Character (data) {
        angular.extend(this, data);
      }

      Character.prototype = Object.create(null);

      // "Mix-in" the character behaviors
      angular.extend(Character.prototype, characterBehaviors);

      /**
       * Factory function to create instances
       * @param  {Object} data JSON character data
       * @return {Object}      A new character instance
       * @public
       */
      function create (data) {
        return new Character(data);
      }

      // Pulic API
      return {
        create: create
      };
    })

    .factory('characterBehaviors', function () {

      /* jshint validthis: true */

      /**
       * Returns the max level allowed
       * @param  {String} Numeric String (integer between 1 and 4)
       * @return {Number}
       * @public
       */
      function getMaxLevel (tier) {
        tier = +tier;
        if (-1 === [1,2,3,4].indexOf(tier)) {
          throw new Error('invalid argument: tier');
        }
        return this.maxLevel[tier - 1];
      }

      /**
       * Generic Formula for calculating attribute values
       * Uses linear equation (slope intercept form) to calculate the desired
       * attribute. Attribute deltas and initial values are defined per tier.
       * This method assumes quite a bit about the structuring of the data (eg;
       * the names and structure of arrays containing the constants mentioned above)
       * @param  {String} quantity The quantifiable attribute to calculate
       * @param  {Number} level
       * @param  {String} tier
       * @return {Number}
       * @private
       */
      function getQuantity (quantity, level, tier) {
        var field;
        if (-1 === ['health', 'power'].indexOf(quantity)) {
          throw new Error('invalid argument: quantity');
        }
        if (level > this.getMaxLevel(tier)) {
          level = this.getMaxLevel(tier);
        }
        field = quantity[0].toUpperCase() + quantity.slice(1);
        return this['del' + field][tier - 1] * (level - 1) + this['base' + field][tier - 1];
      }

      /**
       * Returns the health attribute quantity
       * Convenience method for getQuantity
       * @param  {Number} level
       * @param  {String]} tier  Integer 0 < x < 5
       * @return {Number}
       * @public
       */
      function getHealth (level, tier) {
        return getQuantity.call(this, 'health', level, tier);
      }

      /**
       * Returns the power attribute quantity
       * Convenience method for getQuantity
       * @param  {Number} level
       * @param  {String} tier  Integer 0 < x < 5
       * @return {Number}
       * @public
       */
      function getPower (level, tier) {
        return getQuantity.call(this, 'power', level, tier);
      }

      // Public API
      return {
        getMaxLevel: getMaxLevel,
        getHealth: getHealth,
        getPower: getPower
      };
    });

})();
