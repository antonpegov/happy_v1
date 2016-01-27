'use strict';

describe('Directive: niceTable', function () {

  // load the directive's module
  beforeEach(module('adminApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<nice-table></nice-table>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the niceTable directive');
  }));
});
