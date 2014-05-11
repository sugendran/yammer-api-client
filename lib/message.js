var Backbone = require('backbone');
var withIdentityMap = require('backbone-with-identity-map');
var utils = require('./utils');

var Message = Backbone.Model.extend({
  sync: require('./sync'),

  initialize: function (attributes, options) {
    var thread = this.thread();
    if (thread) {
      thread.messages().add(this);
    }
  },

  parse: function (response) {
    var attrs = _.pick(response, 'body', 'content_excerpt', 'created_at',
      'direct_message', 'group_id', 'id', 'language', 'message_type', 
      'network_id', 'privacy', 'replied_to_id', 'sender_id', 'sender_type',
      'thread_id');
    attrs.body = attrs.body.parsed || attrs.body.plain;
    attrs.created_at = utils.parseDate(attrs.created_at);
    return attrs;
  },

  toJSON: function () {
    return this.pick('body', 'replied_to_id', 'group_id', 'broadcast');
  },

  url: function () {
    return 'messages/' + this.id;
  },
  
  sender: function () {
    var User = require('./user');
    var type = this.get('sender_type');
    var id = this.get('sender_id');
    if (type == 'user' && id) {
      return User.findOrCreate({ id: id });
    }
  },

  repliedTo: function () {
    var User = require('./user');
    var id = this.get('replied_to_id');
    if (id) {
      return User.findOrCreate({ id: id });
    }
  },

  thread: function () {
    var Thread = require('./thread');
    var id = this.get('thread_id');
    if (id) {
      return Thread.findOrCreate({ id: id });
    }
  }
});

withIdentityMap.call(Message);


module.exports = Message;

