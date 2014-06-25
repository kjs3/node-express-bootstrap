var express = require('express');
var router = express.Router();
var debug = require('debug')('route:index');
var asset = require('../lib/asset-loader.js');

var vendorJsSrc = asset('/javascripts/vendor.js');
var jsSrc = asset('/javascripts/app.min.js');
var cssSrc = asset('/stylesheets/app.min.css');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    vendorJsSrc: vendorJsSrc,
    jsSrc: jsSrc,
    cssSrc: cssSrc,
    title: 'Node Express Bootstrap'
  });
});

module.exports = router;
