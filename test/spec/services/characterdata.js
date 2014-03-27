'use strict';

describe('Service: characterdata', function () {

  // load the service's module
  beforeEach(module('hodaApp'));

  // instantiate service
  var characterdata;
  beforeEach(inject(function (_characterdata_) {
    characterdata = _characterdata_;
  }));

  it('should do something', function () {
    expect(!!characterdata).toBe(true);
  });

});
