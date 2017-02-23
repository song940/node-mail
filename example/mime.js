const Message = require('../mime');

// console.log( MIME.extension( MIME.lookup('a.txt') ) );
// 
var message = new Message({
  from : '',
  to   : '',
  cc   : '',
  bcc  : '', 
  subject: '',
  content: '',
});

console.log(message.toString());