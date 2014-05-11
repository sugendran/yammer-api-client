var _ = require('underscore');
var Backbone = require('backbone');
var withIdentityMap = require('backbone-with-identity-map');
var utils = require('./utils');

var User = Backbone.Model.extend({
  parse: function (response) {
    var attrs = _.pick(response, 'activated_at', 'admin', 'full_name',
      'id', 'mugshot_url_template', 'name', 'network_id');

    attrs.activated_at = utils.parseDate(attrs.activated_at);
    return attrs;
  },

  sync: require('./sync'),

  url: function () {
    return 'users/' + this.id;
  },

  groups: function () {
    var Groups = require('./groups');
    return Groups.forUser(this.id);
  },

  bookmarkedMessages: function () {
    var Messages = require('./messages');
    return Messages.bookmarkedBy(this.id);
  }
});


withIdentityMap.call(User);

module.exports = User;


