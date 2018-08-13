const Message = require('../mime');
const EventEmitter = require('events');

class Connection extends EventEmitter {
  constructor(socket){
    super();
    this.msg = '';
    this.message = {};
    var data = '', parts = [];
    this.socket = socket;
    this.socket.on('error', err => {
      this.emit('error', err);
    });
    this.socket.on('data', chunk => {
      data += chunk;
      parts = data.split(Message.CRLF);
      data = parts.pop();
      parts.forEach(this.parse.bind(this));
    });
    this.response(220, 'Mail Server');
  }
  write(buffer){
    this.socket.write(buffer);
    return this;
  }
  response(code, message){
    return this.write(`${code} ${message}${Message.CRLF}`);
  }
  close(){
    this.socket.end();
    return this;
  }
  parse(line){
    switch(line.split(/\s/)[0]){
      case 'HELO':
      case 'EHLO':
        this.response(250, 'OK');
        this.msg = '';
        break;
      case 'MAIL':
        this.message.from = line.split(':')[1];
        this.response(250, 'OK');
        this.msg = '';
        break;
      case 'RCPT':
        (this.message['recipients'] ||
        (this.message['recipients'] = [])).push(line.split(':')[1]);
        this.response(250, 'OK');
        this.msg = '';
        break;
      case 'DATA':
        this.response(354, 'start input end with . (dot)');
        this.msg = '';
        break;
      case '.':
        Object.assign(this.message, Message.parse(this.msg));
        this.response(250, 'Bye');
        this.msg = '';
        break;
      case 'QUIT':
        this.emit('message', this.message);
        this.close();
        break;
      default:
        this.msg += line + Message.CRLF;
        break;
    }
  }
}

module.exports = Connection;