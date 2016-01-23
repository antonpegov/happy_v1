'use strict';

describe('Controller: ReceptionCtrl', function () {

  // load the controller's module
  beforeEach(module('happyTurtlesApp'));

  var ReceptionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReceptionCtrl = $controller('ReceptionCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
