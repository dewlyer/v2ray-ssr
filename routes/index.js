const router = require('express').Router();

router.get('/', (req, res, next) => {
  res.render('index', {title: '服务器'});
  next();
});

module.exports = router;
