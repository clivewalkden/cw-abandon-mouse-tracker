(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */
  var lifecycle = {
    setup: function() {
      this.cookieName = 'test';

      $.CWAbandonMouseTracker({
        cookieName: this.cookieName
      });
    },
    teardown: function() {
      // Clear all cookies
      $.each($.cookie(), $.removeCookie);
    }
  };

  module('setup', lifecycle);

  test('is inited', function() {
    expect(1);

    strictEqual($.cookie(this.cookieName), 'false', 'Cookie is created');
  });

  test('cookie is set to true', function() {
    expect(1);
    $.CWAbandonMouseTracker('cookieSet');
    strictEqual($.cookie(this.cookieName), 'true', 'Cookie is set');
  });

}(jQuery));
