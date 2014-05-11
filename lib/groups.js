var Backbone = require('backbone');
var Group = require('./group');

var Groups = Backbone.Collection.extend({
  model: Group.findOrCreate,

  initialize: function (attributes, options) {
    if (options && options.url) {
      this.url = _.isFunction(options.url) ?
        _.bind(options.url, this) : options.url;
    }
  },

  sync: require('./sync'),

  comparator: function (group) {
    return -group.get('last_message_at');
  }

}, {
  forUser: function (id) {
    return new Groups([], { 
      url: 'groups/for_user/' + id
    });
  }
});

Groups.forUser = _.memoize(Groups.forUser);

module.exports = Groups;
