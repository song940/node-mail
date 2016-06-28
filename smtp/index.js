exports.Client = require('./client');
exports.Server = require('./server');

exports.createServer = function(handler){
  return new exports.Server({}, handler);
};
