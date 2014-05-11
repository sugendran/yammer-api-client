var _ = require('underscore');
var Backbone = require('backbone');
var withIdentityMap = require('backbone-with-identity-map');
var utils = require('./utils');


var Group = Backbone.Model.extend({

  parse: function (response) {
    var attrs = _.pick(response, 'created_at', 'creator_id', 'creator_type',
      'description', 'full_name', 'id', 'mugshot_url_template', 'privacy',
      'show_in_directory', 'state', 'stats', 'last_message_at', 
      'last_message_id', 'members', 'updates');

    attrs = _.extend(attrs, attrs.stats || {});
    delete attrs.stats;

    attrs.created_at = utils.parseDate(attrs.created_at);
    attrs.last_message_at = utils.parseDate(attrs.last_message_at);

    return attrs;
  },

  sync: require('./sync'),

  url: function () {
    return 'groups/' + this.id;
  },

  mugshotUrl: function (width, height) {
    return (this.get('mugshot_url_template') || "")
      .replace('{width}', width)
      .replace('{height}', height);
  },

  creator: function () {
    var User = require('./user');
    if (this.get('creator_type') == 'user') {
      return User.findOrCreate({ id: this.get('creator_id') });
    }
  },

  messages: function () {
    var Messages = require('./messages');
    return Messages.inGroup(this.id);
  }
});

withIdentityMap.call(Group);

module.exports = Group;

