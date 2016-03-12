const Utils = require('../lib/utils');

const CRLF = '\r\n';
/**
 * [function description]
 * @param  {[type]} mail [description]
 * @return {[type]}      [description]
 */
function Message(mail){
  this.data = [];
  this.header('From' , mail.from);
  if(mail.to) this.header('To'   , Array.isArray(mail.to) ? mail.to.join(',') : mail.to);
  if(mail.cc) this.header('Cc'   , Array.isArray(mail.cc) ? mail.cc.join(',') : mail.cc);
  this.header('Subject'                  , mail.subject);
  this.header('MIME-Version'             , mail.version || '1.0');
  this.header('Message-ID'               , Utils.q(mail.id || (+new Date)));
  this.header('Content-Type'             , 'text/plain; charset=utf-8');
  this.header('Content-Transfer-Encoding', mail.encoding || (mail.encoding = 'base64'));
  for(var name in mail.headers){
    this.header(name, mail.headers[name]);
  }
  this.data.push('');
  this.data.push(new Buffer(mail.content).toString(mail.encoding));
  return this;
};
/**
 * [function description]
 * @param  {[type]} name  [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Message.prototype.header = function(name, value){
  this.data.push(Utils.kv(name, value));
};
/**
 * [function description]
 * @return {[type]} [description]
 */
Message.prototype.toString = function(){
  return this.data.join(CRLF);
};

module.exports = Message;
