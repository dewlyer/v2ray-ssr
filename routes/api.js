const router = require('express').Router();
const Controller = require('../controllers');

router.get('/servers/list', (req, res, next) => {
  Controller.getServerList((err, servers) => {
    res.json(servers);
  }, (err) => {
    return next(err);
  });
});

router.get('/servers/rss', (req, res, next) => {
  Controller.getServerRss((result) => {
    res.send(result);
  }, (err) => {
    next(err);
  });
});

router.post('/servers/sync', (req, res, next) => {
  Controller.updateSource(() => res.send('OK'));
});

router.post('/servers/proxy', (req, res, next) => {
  Controller.updateSource(() => res.send('OK'), true);
});

router.get('/server/:id', (req, res, next) => {
  const id = req.params.id;
  Controller.findServer(id, (err, server) => {
    if (err) {
      return next(err);
    }
    res.json(server);
  });
});

router.delete('/servers/:id', (req, res, next) => {
  const id = req.params.id;
  Controller.deleteServer(id, err => {
    if (err) {
      return next(err);
    }
    res.send({message: 'Deleted'});
  });
});

module.exports = router;

// module.exports.polling = minutes => (req, res, next) => {
//     global.setInterval(updateSource, minutes * 60000);
//     next();
// };

