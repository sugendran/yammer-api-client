var Backbone = require('backbone');
var _ = require('underscore');
var Message = require('./message');
var Realtime = require('./realtime');


// Maps reference 'types' to real models
var referenceMap = {
  'thread': require('./thread'),
  'group': require('./group'),
  'user': require('./user')
};


var Messages = Backbone.Collection.extend({

  initialize: function (models, options) {
    if (options && options.url) {
      this.url = _.isFunction(options.url) ?
        _.bind(options.url, this) : options.url;
    }
  },

  subscribe: function () {
    var realtime = new Realtime();
    var channels = [
      '/feeds/' + this._channelId + '/primary',
      '/feeds/' + this._channelId + '/secondary'
    ];

    _.each(channels, function (channel) {
      this.listenTo(realtime, 'realtime:' + channel, function (payload) {
        this.set(payload, { remove: false, parse: true });
      });
    }, this);
    realtime.subscribe(channels);
  },

  unsubscribe: function () {
    var realtime = new Realtime();
    var channels = [
      '/feeds/' + this._channelId + '/primary',
      '/feeds/' + this._channelId + '/secondary'
    ];
    realtime.unsubscribe(channels);
  },

  sync: require('./sync'),

  model: Message.findOrCreate,

  comparator: threadLatestReplyAt,

  parse: function (response) {
    var threadstarterIds, messages;

    if (!_.isUndefined(response.older_available)) {
      this._hasOlder = response.older_available;
    }
    if (response.meta && response.meta.realtime) {
      this._channelId = response.meta.realtime.channel_id;
    }

    // We only want the messages return to contain thread starters, as replies
    // are handled automatically when they're instantiated.
    threadstarterIds = _.chain(response.references)
      .where({ type: 'thread' })
      .pluck('thread_starter_id')
      .value();

    // Build an array of all messages in the payload which may be threadstarters
    messages = response.messages
      .concat(_.where(response.references, { type: 'message' }));
    messages = _.groupBy(messages, function (message) {
      return _.indexOf(threadstarterIds, message.id) != -1 ? 
        'threadstarters' : 'replies'
    });

    // Hydrate references (not messages)
    _.each(response.references, function (reference) {
      var Model = referenceMap[reference.type];
      if (Model && Model.findOrCreate) {
        Model.findOrCreate(_.omit(reference, 'type'), { parse: true });
      }
    });

    // Hydrate non-threadstarter messages.
    messages.replies = (messages.replies || [])
      .concat(_.flatten(response.threaded_extended));
    _.each(messages.replies, function (attributes) {
      new this.model(attributes, { parse: true });
    },  this);

    // 
    _.each(response.meta.bookmarked_message_ids || [], function (id) {
      Message.findOrCreate({ id: id, bookmarked: true });
    });

    // Return only threadstarters
    return messages.threadstarters || [];
  },

  hasOlder: function () {
    return !!this._hasOlder;
  },

  fetch: function (options) {
    options = _.defaults(options || {}, { data: {} });
    options.data = _.defaults(options.data, { threaded: 'extended' });
    return Backbone.Collection.prototype.fetch.call(this, options);
  },

  fetchOlder: function (options) {
    options = _.defaults(options || {}, { remove: false, data: {} });
    if (this.last()) { options.data.older_than = this.last().id; }
    return this.fetch(options);
  },

  fetchNewer: function (options) {
    options = _.defaults(options || {}, { remove: false, data: {} });
    if (this.first()) { options.data.newer_than = this.first().id; }
    return this.fetch(options);
  }

}, {
  all: function () {
    return new Messages([], { url: 'messages' });
  },

  algo: function () {
    return new Messages([], { url: 'messages/algo' });
  },

  following: function () {
    return new Messages([], { url: 'messages/following' });
  },

  sent: function () {
    return new Messages([], { url: 'messages/sent' });
  },

  'private': function () {
    return new Messages([], { url: 'messages/private' });
  },

  received: function () {
    return new Messages([], { url: 'messages/received' });
  },

  inbox: function () {
    return new Messages([], { url: 'messages/inbox' });
  },

  inThread: function (id) {
    return new Messages([], {
      url: 'messages/in_thread/' + id,
      comparator: messageCreatedAt
    });
  },

  inGroup: function (id) {
    return new Messages([], { url: 'messages/in_group/' + id });
  },

  bookmarkedBy: function (id) {
    return new Messages([], { url: 'messages/bookmarked_by/' + id });
  }
});

// Memoize all the filter methods.
var keys = ['all', 'algo', 'following', 'sent', 'private', 'received',
  'inbox', 'inThread', 'inGroup', 'bookmarkedBy'];
_.each(keys, function (key) {
  Messages[key] = _.memoize(Messages[key]);
});

// Comparator to sort in order of `created_at`.
function messageCreatedAt(message) {
  return message.get('created_at');
}

// Comparator to sort in order of thread activity.
function threadLatestReplyAt(message) {
  return -message.thread().get('latest_reply_at');
}


module.exports = Messages;


