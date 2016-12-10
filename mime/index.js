const util   = require('util');
const Stream = require('stream');

function MIME(){
  this.buffer = '';
  this.headers = {};
  this.body = {};
  return this;
};

MIME.CRLF = '\n';

util.inherits(MIME, Stream);

MIME.parse = function(content){
  var mime = new MIME();
  mime.end(content);
  return mime;
};

MIME.kv = function(key, value){
  return [ key, value ].join(':');
};

MIME.q = function(address){
  return '<' + address + '>';
};

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
  this.buffer = parts.join(MIME.CRLF + MIME.CRLF);
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
 * [parseHeader description]
 * @param  {[type]} header [description]
 * @return {[type]}        [description]
 */
MIME.prototype.parseHeader = function(header){
  var headers = {};
  function trim(s){
    return s.replace(/^"|"$/, '');
  }
  header.replace(/\n\t/g, '').split(MIME.CRLF).filter(function(line){
    return !!line;
  }).forEach(function(line){
    var m = line.match(/^(.+?):\s?(.*)/);
    var k = m[2].split(/;\s?/);
    var h = {};
    k.forEach(function(t){
      var kv = trim(t).match(/^(.+?)=(.*)$/);
      if(kv){
        h[ kv[1] ] = trim(kv[2]);
      }else{
        h._ = trim(t);
      }
    });
    headers[ m[1] ] = h;
  });
  return headers;
};



/**
 * [end description]
 * @param  {[type]} buf [description]
 * @return {[type]}     [description]
 */
MIME.prototype.parseBody = function(content){
  var contentType = this.headers[ 'Content-Type' ];
  var self = this, i=0, j=-1, h = '', body = { _: '' };
  var lines = content.split('\n');
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

module.exports = MIME;

