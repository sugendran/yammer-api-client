var _ = require('underscore');
var Backbone = require('backbone');

function currentUser() {
  var CurrentUser = require('./current_user');
  return new CurrentUser();
}

module.exports = {
  currentUser: _.memoize(currentUser),
  Message: require('./message'),
  Messages: require('./messages'),
  Thread: require('./thread'),
  Group: require('./group'),
  User: require('./user'),
  Users: require('./users'),
  // Notifications
  // Suggestions
  // Subscriptions
  // Autocomplete
  // Invitations
  // Search  
  // Networks
  Network: require('./network'),
  Tag: require('./tag'),
  Realtime: require('./realtime')
};

