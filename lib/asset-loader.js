var cacheBust = require('../cache-bust.json');

// strip off the 'public' part of the filename
for(var key in cacheBust){
  var tmpArray = key.split('/');
  tmpArray.splice(0,1);
  var newKey = tmpArray.join('/');
  cacheBust[newKey] = cacheBust[key];
  // so that it works with or without the leading slash add that key too
  cacheBust['/'+newKey] = cacheBust[key];
}

module.exports = function(path) {
  return path + (cacheBust[path] ? '?' + cacheBust[path] : '');
};