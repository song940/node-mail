const smtp = require('../../smtp');

smtp.send({
  from   : 'Lsong<song940@qq.com>',
  to     : 'song940@qq.com'     ,
  subject: '天气不错',
  content: '今天天气不错，一起出去旅行吧。'
}, function(err, reply){
  console.log(err, reply);
});
