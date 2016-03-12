const dns = require('dns');
const tcp = require('net');

const Utils   = require('../lib/utils');
const Message = require('./message');

const CRLF = '\r\n';

/**
 * [SMTPClient description]
 */
function SMTPClient(options){

};
/**
 * [function description]
 * @param  {[type]}   domain   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
SMTPClient.prototype.connectMx = function(domain, callback){
  dns.resolveMx(domain, function(err, mx){
    if(err) return callback(err);
    mx.sort(function(a, b){ a.priority < b. priority });
    if(!mx || !mx.length) return callback(new Error('can not resolve Mx of <' + domain + '>'));
    (function connect(i){
      if (i >= mx.length) return callback(new Error('can not connect to any SMTP server'));
      var sock = tcp.createConnection(25, mx[ i ].exchange).on('error', function(err){
        console.error('Error on connectMx for: ', mx[ i ], err);
        connect(++i);
      }).on('connect', function(){
        console.log("MX connection created: ", mx[i].exchange);
        sock.removeAllListeners('error');
        callback(null, sock);
      });
    })(0);
  });
};
/**
 * [function description]
 * @param  {[type]}   domain     [description]
 * @param  {[type]}   from       [description]
 * @param  {[type]}   recipients [description]
 * @param  {[type]}   body       [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
SMTPClient.prototype.post = function(domain, from, recipients, body, callback){
  var queue = [], step = 0;
  function command(cmd, argv){
    return cmd + (argv ? (' ' + argv) : '');
  };
  queue.push(command('MAIL', Utils.kv('FROM', Utils.q(from.address))));
  queue = queue.concat(recipients.map(function(recipient){
    return command('RCPT', Utils.kv('TO', Utils.q(recipient)));
  }));
  queue.push('DATA');
  queue.push('QUIT');
  queue.push('');
  this.connectMx(domain, function(err, sock){
    if(err) return callback(err);
    /**
     * [w description]
     * @param  {[type]} s [description]
     * @return {[type]}   [description]
     */
    function w(s){
      console.log('-> %s', s);
      sock.write(s + CRLF);
    };
    /**
     * [response description]
     * @param  {[type]} code [description]
     * @param  {[type]} msg  [description]
     * @return {[type]}      [description]
     */
    function response(code, msg){
      switch(code){
        case 220:
          if(/ESMTP/i.test(msg)){
            w(command('EHLO', from.host))
          }else{
            w(command('HELO', from.host))
          }
          break;
        case 221:
          sock.end();
          break;
        case 250:
          w(queue[step++]);
          break;
        case 354:
          w(body);
          w('');
          w('.');
          break;
        default:
          console.error('-x SMTP responds error code %s', code);
          sock.end();
          break;
      };
    };
    /**
     * [msg description]
     * @type {String}
     */
    var msg = '';
    function parse(line){
      console.log('<- %s', line);
      msg += (line + CRLF);
      if(/^\d+\s/.test(line)){
        response(parseInt(line, 10), msg);
        msg = '';
      }
    }
    /**
     * [data description]
     * @type {String}
     */
    var data = '', parts = []
    sock.on('error', function(){
       console.error('-x fail to connect ');
    }).on('data', function(chunk){
      data += chunk;
      parts = data.split(CRLF);
      data = parts.pop();
      parts.forEach(parse);
    });

  });
};

/**
 * [function description]
 * @param  {[type]}   mail     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
SMTPClient.prototype.send = function(mail, callback){
  var self = this, body = new Message(mail), groupByHost = {}, recipients = [];
  if(mail.to) recipients.push(mail.to);
  if(mail.cc) recipients.push(mail.cc);
  if(mail.bcc)recipients.push(mail.bcc);
  recipients = recipients.map(function(recipient){
    var address = Utils.parseAddress(recipient);
    (groupByHost[ address.host ] ||
    (groupByHost[ address.host ] = [])).push(address.address);
    return address.address;
  });
  var from = Utils.parseAddress(mail.from);
  Object.keys(groupByHost).map(function(domain){
    self.post(domain, from, groupByHost[domain], body, callback);
  });
};

module.exports = SMTPClient;
