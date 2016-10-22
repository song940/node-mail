
const util   = require('util');
const Stream = require('stream');

const CRLF = '\n';

function Message(mail){
  this.buffer = '';
  this.headers = {};
  this.body = {};
  this.data = [];
  if(mail){
    this.header('From' , mail.from);
    if(mail.to) this.header('To'   , Array.isArray(mail.to) ? mail.to.join(',') : mail.to);
    if(mail.cc) this.header('Cc'   , Array.isArray(mail.cc) ? mail.cc.join(',') : mail.cc);
    this.header('Subject'                  , mail.subject);
    this.header('MIME-Version'             , mail.version || '1.0');
    this.header('Message-ID'               , q(mail.id || (+new Date)));
    this.header('Content-Type'             , 'text/plain; charset=utf-8');
    this.header('Content-Transfer-Encoding', mail.encoding || (mail.encoding = 'base64'));
    for(var name in mail.headers){
      this.header(name, mail.headers[name]);
    }
    this.data.push('');
    this.data.push(new Buffer(mail.content).toString(mail.encoding));
  }
  return this;
};

util.inherits(Message, Stream);


/**
 * [write description]
 * @param  {[type]} buf [description]
 * @return {[type]}     [description]
 */
Message.prototype.write = function(buf){
  this.buffer += buf;
  var parts = this.buffer.split(CRLF + CRLF);
  if(parts.length >= 2){
    var header = parts.shift();
    this.headers = this.parseHeader(header);
    this.emit('header', this.headers);
  }
  this.buffer = parts.join(CRLF + CRLF);
  return this;
};

/**
 * [end description]
 * @param  {[type]} buf [description]
 * @return {[type]}     [description]
 */
Message.prototype.end = function(buf){
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
Message.prototype.parseHeader = function(header){
  var headers = {};
  function trim(s){
    return s.replace(/^"|"$/, '');
  }
  header.replace(/\n\t/g, '').split(CRLF).filter(function(line){
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
Message.prototype.parseBody = function(content){
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
      h += line + CRLF;
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
Message.prototype.header = function(name, value){
  this.data.push(kv(name, value));
};
/**
 * [function description]
 * @return {[type]} [description]
 */
Message.prototype.toString = function(){
  return this.data.join(CRLF);
};


module.exports = Message;

