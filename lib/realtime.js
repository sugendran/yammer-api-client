var $ = window.jQuery || require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var _instance;

var DISCONNECTED = 0;
var CONNECTING = 1;
var CONNECTED = 2;

var Realtime = Backbone.Model.extend({

  defaults: {
    state: DISCONNECTED
  },

  constructor: function () {
    if (!_instance) {
      Backbone.Model.apply(this, arguments);
      _instance = this;
    }
    return _instance;
  },

  initialize: function () {
    var model = this;

    this._messageId = 0;
    this._channels = [];

    _.bindAll(this, 
      '_handshake', '_subscribe', '_unsubscribe', '_connect', '_disconnect',
      '_messageReceived', 
      '_connecting', '_connected', '_disconnected');

    this.listenTo(this, {
      'change': this._changed
    });

    yam.platform.getLoginStatus(function (response) {
      model.set('token', response.access_token.token);
    });
  },

  url: 'realtime',

  parse: function (response) {
    return { realtime_uri: response.realtimeURI };
  },

  sync: require('./sync'),

  subscribe: function (channels) {
    channels = _.isArray(channels) ? channels : [channels];
    channels = _.difference(channels, this._channels);
    this._channels = this._channels.concat(channels);

    if (!channels.length) {
      return;
    } else if (this.get('state') == DISCONNECTED) {
      this._handshake();
    } else if (this.get('state') == CONNECTED) {
      this._subscribe(channels);
    }
  },

  unsubscribe: function (channels) {
    channels = _.isArray(channels) ? channels : [channels];
  },

  _changed: function (model, options) {
    var token = model.get('token');
    var uri = model.get('realtime_uri');
    var state = model.get('state');
    var previousState = model.previous('state');
    var clientId = model.get('client_id');

    if (state == DISCONNECTED && token && uri) {
      // We're disconnected, but ready to connect.
      this._handshake()
    } else if (state == CONNECTED && clientId) {
      // We've just connected, so start polling.
      this._connect();
    }
  },

  _connecting: function () {
    this.set('state', CONNECTING);
  },

  _connected: function (response) {
    this.set('state', CONNECTED);
    this.set('client_id', response[0].clientId);
    this._subscribe(this._channels);
  },

  _disconnected: function (response) {
    this.set('state', DISCONNECTED);
    this.unset('client_id');
  },

  _handshake: function () {
    var payload = [{
      ext: { 
        token: this.get('token'),
        auth: 'oauth'
      },
      version: '1.0',
      minimumVersion: '0.9',
      channel: '/meta/handshake',
      supportedConnectionTypes: ['long-polling'],
      id: ++this._messageId
    }];

    this._connecting();

    return $.ajax({
      url: this.get('realtime_uri') + 'handshake',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload)
    }).fail(this._disconnected).done(this._connected);

  },

  _subscribe: function (channels) {
    var payload = _.map(channels, function (subscription) {
      return {
        channel: '/meta/subscribe',
        subscription: subscription,
        id: ++this._messageId,
        clientId: this.get('client_id')
      }
    }, this);

    return $.ajax({
      url: this.get('realtime_uri'),
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload)
    });
  },

  _unsubscribe: function () { },

  _connect: function () { 
    var payload = [{
      channel: '/meta/connect',
      connectionType: 'long-polling',
      id: ++this._messageId,
      clientId: this.get('client_id')
    }];
  
    return $.ajax({
      url: this.get('realtime_uri') + 'connect',
      type: 'POST',
      data: JSON.stringify(payload),
      contentType: 'application/json'
    }).fail(this._disconnected).done(this._messageReceived);
  },

  _messageReceived: function (response) {

    // If there's no error poll again.
    var success = _.findWhere(response, { 
      channel: '/meta/connect',
      successful: true
    });
    if (success) { this._connect(); }

    // Fire an event for each payload received.
    _.chain(response)
      .filter(function (message) {
        return _.indexOf(this._channels, message.channel) != -1;
      }, this)
      .each(function (message) {
        this.trigger('realtime:' + message.channel, message.data.data);
      }, this);
  },

  _disconnect: function () { }
});


module.exports = Realtime;
