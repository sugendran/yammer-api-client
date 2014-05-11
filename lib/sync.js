function sync(method, model, options) {

  var url = _.result(model, 'url');

  var params = { url: url + '.json', dataType: 'json' };
  var handle = yam.platform.request(_.extend(params, options));
  var xhr = options.xhr = handle.xhr;
  return xhr;
}

module.exports = sync;
