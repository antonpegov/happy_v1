'use strict';

describe('Service: langs', function () {

  // load the service's module
  beforeEach(module('publicApp'));

  // instantiate service
  var langs;
  beforeEach(inject(function (_langs_) {
    langs = _langs_;
  }));

  it('should do something', function () {
    expect(!!langs).toBe(true);
  });

});
