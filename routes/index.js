const router = require('express').Router();

router.get('/', (req, res, next) => {
    res.render('index', {title: 'V2Ray Server Sync List'});
});

module.exports = router;
