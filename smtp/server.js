const tcp = require('net');
const Connection = require('./connection');

class SMTPServer extends tcp.Server {
  constructor(options, handler){
    super();
    if(typeof options === 'function'){
      handler = options;
      options = {};
    }
    Object.assign(this, options);
    this.on('connection', socket => {
      const client = new Connection(socket);
      this.emit('client', client);
    });
    this.on('client', client => {
      client.on('message', message => {
        this.emit('message', message, client);
      });
    });
    this.on('message', handler);
    return this;
  }
}

module.exports = SMTPServer;
