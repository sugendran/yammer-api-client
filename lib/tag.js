var _ = require('underscore');
var Backbone = require('backbone');
var withIdentityMap = require('backbone-with-identity-map');

var Tag = Backbone.Model.extend({
  parse: function (response) {
    console.log(response);
    return response;
  },

  sync: require('./sync'),

  url: function () {
    return 'tags/' + this.id;
  }
});


withIdentityMap.call(Tag);

module.exports = Tag;



