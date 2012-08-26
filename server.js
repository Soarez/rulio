var irc = require('irc');
var fs = require('fs');

var conf = JSON.parse(fs.readFileSync('config.json').toString());

var client = new irc.Client(conf.server, conf.nick, conf.client);

if (conf.password) {
  client.addListener('notice', function (from, to, text) {
    console.log(text);

    if (text.indexOf('This nickname is registered.') != -1) {
     client.say('NickServ', "identify " + conf.password);
     console.log('Identifying...');
    }
  });
}

conf.modules.forEach(function(name) {
  try {
    var module = require('./modules/'+name) || require(name);
    module(client);
  } catch (e) {
    console.log('Failed to load module %s - %s', name, e);
    return;
  }
  
  console.log('Loaded module %s', name);
});

client.connect(conf.connectRetryCount, function() {
  console.log('Connection established.');
});

console.log('Connecting to %s...', conf.server);
