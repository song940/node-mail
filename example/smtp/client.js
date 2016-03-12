const SMTP = require('../../smtp');

const client = new SMTP.Client({});

client.send({
  from: 'Lsong<song940@163.com>',
  // to  : 'Liu song<song940@163.com>',
  // cc  : 'lsong<song940@me.com>' ,
  to : '1323397889@qq.com' ,

  subject: '测试邮件'      ,
  content: '测试邮件'
}, function(err, reply){
  console.log(err, reply);
});
//
