var $ = window.$ || window.jQuery;
var Backbone = require('backbone');

var User = require('./user'); 
var Messages = require('./messages');
var Groups = require('./groups');
var Realtime = require('./realtime');


var CurrentUser = User.extend({

  isLoggedIn: function () {
    return this.has('id');
  },

  sync: function (method, model, options) {
    var deferred;

    model.trigger('request');

    if (!model.isNew()) {
      return User.prototype.sync.apply(this, arguments);
    }

    deferred = $.Deferred();
    yam.platform.getLoginStatus(function (response) {
      var realtime;
      if (response.authResponse) {
        if (options.success) { options.success(response.user); }
        realtime = new Realtime();
        realtime.fetch();
        deferred.resolve();
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

