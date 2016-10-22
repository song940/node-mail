const send = require('../../smtp/client');

send({
  from : 'Lsong<song940@163.com>' ,
  to   : 'song940@localhost'      ,

  subject: '天气不错',
  content: '今天天气不错，一起出去旅行吧。'
}, function(err, reply){
  console.log(err, reply);
});
