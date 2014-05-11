var Backbone = require('backbone');
var User = require('./user');

var Users = Backbone.Collection.extend({
  url: 'users'
});

module.exports = Users;
   

