'use strict';

describe('Controller: UploadwordsCtrl', function () {

  // load the controller's module
  beforeEach(module('happyTurtlesApp'));

  var UploadwordsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UploadwordsCtrl = $controller('UploadwordsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
