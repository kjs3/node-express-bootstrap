var readline = require('readline');
var stream = require('stream');
var url = require('url');
var redis = require("redis");

if (process.env.NODE_ENV === 'production') {
  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  client.auth(redisURL.auth.split(":")[1]);
}else{
  var client = redis.createClient();
}

// Create the completion sorted set
client.exists("compilation", function(err, exists){
  if(!exists){

    console.log('Loading entries into the Redis DB.\n');
    var names = fs.createReadStream('./lib/female-names.txt');
    var out = new stream;
    var rl = readline.createInterface({
      input: names,
      output: out
    });

    rl.on("line", function(name) {
      name = new Buffer(name.replace(/ /g,''),'utf-8');
      for (var char = 0; char <= name.length ; char++) {
        var prefix = name.toString('utf-8', 0, char);
        // console.log(prefix);
        client.zadd("compilation", 0, prefix, function(err, res){});
      }
      client.zadd("compilation", 0, name.toString('utf-8') + "*");
    });

    names.on('end', function(){
      rl.close();
      names.close();
      // client.quit();
    });

  }else{
    console.log("NOT loading entries, there is already a 'compilation' key\n");
  }
});

function getPrefixes(prefix, count, callback){
  var results = [];
  var rangelen = 50; // This is not random, try to get replies < MTU size

  client.zrank("compilation", prefix, function(err, res){
    var start = res;

    client.zrange("compilation", start, start+rangelen-1, function(err, res){
      var range = res;
      start += rangelen;
      if(range && range.length > 0){
        for(var i in range){
          var entry = range[i];
          var minLength = Math.min(entry.length,prefix.length);
          if( entry.substring(0,minLength) != prefix.substring(0, minLength) ){
            count = results.count
            break;
          }
          if(entry.substring(entry.length - 1) == "*" && results.length != count){
            results.push(entry.substring(0,entry.length - 1));
          }
        }
      }
      callback(results);
    });

  });
}

module.exports = getPrefixes;

// prefixes = getPrefixes("marc",50);
