const smtp = require('../../smtp');

smtp.send({
  headers: {
    From   : 'hi@lsong.org',
    To     : 'liusong02@localhost'  ,
    Subject: 'welcome mail'
  },
  body: { _: 'hello' }
}, function(err, reply){
  console.log(err, reply);
});
