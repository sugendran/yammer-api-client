var $ = window.$ || window.jQuery;
var Backbone = require('backbone');

var User = require('./user'); 
var Messages = require('./messages');
var Groups = require('./groups');
var Realtime = require('./realtime');


var CurrentUser = User.extend({

  sync: function (method, model, options) {
    var deferred;

    // If this isn't a new currentUser just fetch through the API as usual.
    if (!model.isNew()) {
      return User.prototype.sync.apply(this, arguments);
    }

    model.trigger('request');

    // Call getLoginStatus and return our own deferred since getLoginStatus
    // doesn't return one itself.
    deferred = $.Deferred();
    yam.platform.getLoginStatus(function (response) {
      var realtime;
      if (response.authResponse) {
        if (options.success) { options.success(response.user); }
        deferred.resolve();

        // When we've got a user connect to realtime.
        // This probably doesn't belong here really.
        realtime = new Realtime();
        realtime.fetch();
      } else {
        if (options.error) { options.error(); }
        deferred.reject();
      }
    });
    return deferred;
  },

  bookmarkMessage: function (id) {
    var handle = yam.platform.request({
      type: 'POST',
      url: 'messages/favorites_of/current.json',
      data: {
        message_id: id
      }
    });
    return handle.xhr;
  },

  allMessages: function () {
    return Messages.all();
  },

  algoMessages: function () {
    return Messages.algo();
  },

  followingMessages: function () {
    return Messages.following();
  },

  inboxMessages: function () {
    return Messages.inbox();
  },

  url: 'users/current'
});


module.exports = CurrentUser;

