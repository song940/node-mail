/**
 * [address description]
 * @param  {[type]} address [description]
 * @return {[type]}         [description]
 */
exports.q = function address(address){
  return '<' + address + '>';
};
/**
 * [kv description]
 * @param  {[type]} k [description]
 * @param  {[type]} v [description]
 * @return {[type]}   [description]
 */
exports.kv = function kv(k, v){
  return [ k, v ].join(':');
};

/**
 * [parseAddress description]
 * @param  {[type]} address [description]
 * @return {[type]}         [description]
 */
exports.parseAddress = function parseAddress(address){
  var host = (address.replace(/^(.+@)/g,'').replace(/>/,''));
  var user = (address.match(/^(?:.+<)?(.+)@.+$/)[1]);
  var name = (address.match(/^(.+)<.+>$/) || [])[1] || '';
  return {
    host    : host,
    user    : user,
    name    : name,
    address : [ user, host ].join('@')
  };
};
