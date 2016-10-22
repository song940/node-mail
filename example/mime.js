const fs     = require('fs');
const path   = require('path');
const Message = require('../mime');

var filename = path.dirname(__dirname) + '/docs/smtp-qq.txt';

var part = new Message();

part.on('header', function(headers){
  // console.log(headers);
});


part.on('body', function(body){
  console.log(body);
});

fs.createReadStream(filename).pipe(part);