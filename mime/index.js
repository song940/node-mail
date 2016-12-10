const util   = require('util');
const Stream = require('stream');

/**
 * [MIME description]
 */
function MIME(){
  this.buffer = '';
  this.headers = {};
  this.body = {};
  return this;
};

MIME.CRLF = '\n';

util.inherits(MIME, Stream);

/**
 * [parse description]
 * @param  {[type]} content     [description]
 * @param  {[type]} contentType [description]
 * @return {[type]}             [description]
 */
MIME.parse = function(content, contentType){
  var mime = new MIME();
  if(typeof contentType === 'undefined'){
    return mime.end(content);
  }else{
    return mime.parseBody(content, contentType); 
  }
};

MIME.q = function(address){
  return '<' + address + '>';
};

MIME.kv = function(key, value){
  return [ key, value ].join(':');
};

MIME.trim = function(s){
  return s.replace(/^"|"$/, '');
}

MIME.filter = function(str){
  return !!str.trim();
};
/**
 * [parseAddress description]
 * @param  {[type]} address [description]
 * @return {[type]}         [description]
 */
MIME.parseAddress = function(address){
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
/**
 * [parseHeader description]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
MIME.parseHeader = function(header){
  var m = header.split(/:\s?/);
  var k = m[0];
  var v = m.slice(1).join('');
  return { key: k, value: MIME.parseHeaderValue(v) } ;
}
/**
 * [parseHeaderValue description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
MIME.parseHeaderValue = function(value){
  var k = value.split(/;\s?/), h = {};
  k.forEach(function(t){
    var kv = MIME.trim(t).match(/^(.+?)=(.*)$/);
    if(kv){
      h[ kv[1] ] = MIME.trim(kv[2]);
    }else{
      h._ = MIME.trim(t);
    }
  });
  return h;
};

/**
 * [write description]
 * @param  {[type]} buf [description]
 * @return {[type]}     [description]
 */
MIME.prototype.write = function(buf){
  this.buffer += buf;
  var parts = this.buffer.split(MIME.CRLF + MIME.CRLF);
  if(parts.length >= 2){
    var header = parts.shift();
    this.headers = this.parseHeader(header);
    this.emit('header', this.headers);
  }
  this.buffer = parts.join(MIME.CRLF);
  return this;
};

/**
 * [end description]
 * @param  {[type]} buf [description]
 * @return {[type]}     [description]
 */
MIME.prototype.end = function(buf){
  if(buf) this.write(buf);
  this.body = this.parseBody(this.buffer);
  this.emit('body', this.body);
  return this;
};

/**
 * [function description]
 * @param  {[type]} name  [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
MIME.prototype.header = function(name, value){
  this.headers[ name ] = value;
  return this;
};

/**
 * [parseHeader description]
 * @param  {[type]} header [description]
 * @return {[type]}        [description]
 */
MIME.prototype.parseHeader = function(header){
  return header
  .replace(/\n\t/g, '')
  .split(MIME.CRLF)
  .filter(MIME.filter)
  .map(MIME.parseHeader)
  .reduce(function(item, cur){
    item[ cur.key ] = cur.value;
    return item;
  }, {});
};

/**
 * [end description]
 * @param  {[type]} buf [description]
 * @return {[type]}     [description]
 */
MIME.prototype.parseBody = function(content, contentType){
  var self = this, i=0, j=-1, h = '', body = { _: '' };
  var lines = (content || '').toString().split(MIME.CRLF);
  contentType = contentType || this.headers[ 'Content-Type' ];
  if(typeof contentType === 'string'){
    contentType = MIME.parseHeaderValue(contentType);
  }
  while(lines.length){
    line = lines.shift();

    if(line == ('--' + contentType.boundary + '--')){
      i = -1;
      break;
    }
    if(line == '--' + contentType.boundary){
      i = 1;
      continue;
    }

    if(i == 0){ // initial
      body._ += line;
    }

    if(i == 1){ // header
      if(line == ''){
        i++;
        j++;
        body[ j ] = { headers: {},  body: '' };
        body[ j ].headers = self.parseHeader(h);
        h = '';
        continue;
      }
      h += line + MIME.CRLF;
    }
    if(i == 2){ // body
      body[ j ].body += line;
    }
  }
  return body;
};

module.exports = MIME;

