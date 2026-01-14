var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express 示例模板',slogan: '欢迎使用腾讯云开发-云托管' });
});

module.exports = router;
