var Backbone = require('backbone');
var withIdentityMap = require('backbone-with-identity-map');
var utils = require('./utils');

var Thread = Backbone.Model.extend({
  parse: function (response) {
    var attrs = _.pick(response, 'direct_message', 'group_id', 
      'has_attachments', 'id', 'privacy', 'thread_starter_id');
    attrs = _.extend(attrs, _.pick(response.stats, 
      'first_reply_at', 'first_reply_id', 'latest_reply_at', 'latest_reply_id',
      'shares', 'updates'));

    if (attrs.first_reply_at) {
      attrs.first_reply_at = utils.parseDate(attrs.first_reply_at);
    }
    if (attrs.latest_reply_at) {
      attrs.latest_reply_at = utils.parseDate(attrs.latest_reply_at);
    }

    return attrs;
  },

  url: function () {
    return 'threads/' + this.id;
  },

  messages: function () {
    var Messages = require('./messages');
    return Messages.inThread(this.id);
  }
});

withIdentityMap.call(Thread);


module.exports = Thread;

