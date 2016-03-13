const smtp = require('../../smtp');

const PORT   = 25;
const server = new smtp.Server({}, function(message){
  console.log(message);
}).listen(PORT, function(err){
  console.log('smtp server is running at %s', PORT);
});
