const SMTP    = require('../../smtp');
const Message = require('../../mime');

var client = new SMTP.Client();

client.send({
  from   : 'Lsong<song940@163.com>',
  to     : 'song940@me.com'     ,
  subject: '天气不错',
  content: '今天天气不错，一起出去旅行吧。'
}, function(err, reply){
  console.log(err, reply);
});
