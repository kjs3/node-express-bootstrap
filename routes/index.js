var express = require('express');
var router = express.Router();
var http = require('http');
var asset = require('../lib/asset-loader.js');

var jsSrc = asset('/javascripts/main.min.js');
var cssSrc = asset('/stylesheets/main.min.css');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    jsSrc: jsSrc,
    cssSrc: cssSrc,
    title: 'Node Express Bootstrap'
  });
});

module.exports = router;
