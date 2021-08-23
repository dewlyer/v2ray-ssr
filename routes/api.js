const router = require('express').Router();
const base64 = require('js-base64').Base64;

const Servers = require('../models/db').Server;
const Services = require('../libs/services');

function updateDataBase(item) {
  return new Promise((resolve, reject) => {
    Servers.create(item, err => {
      if (err) {
        console.log('updateDataBase:', err);
        reject(err);
      } else {
        // console.log('updateDataBase:', item.name);
        resolve();
      }
    });
  });
}

function updateSourceByEachItem(list, cb, index) {
  const length = list.length;
  let current = index || 0;
  if (current < length) {
    updateDataBase(list[current]).then(() => {
      current++;
      updateSourceByEachItem(list, cb, current)
    })
  } else {
    cb();
  }
}

function updateSource(cb, proxy) {
  const callback = (list) => {
    Servers.clear(() => {
      updateSourceByEachItem(list, () => {
        console.log('source sync end ==> ' + new Date().toLocaleString());
        if (typeof cb === 'function') {
          cb();
        }
      });
      // const pList = list.map(item => updateDataBase(item));
      // Promise.all(pList).then(() => {
      //     console.log('source sync end ==> ' + new Date().toLocaleString());
      //     cb && cb();
      // });
    });
  };

  if (proxy) {
    Services.updateSourceDataWithProxy(callback)
  } else {
    Services.updateSourceData(callback)
  }
}

function getSourceRss(cb, error) {
}

router.get('/servers/list', (req, res, next) => {
  Servers.all((err, servers) => {
    if (err) {
      return next(err);
    }
    res.json(servers);
  });
});

router.get('/servers/rss', (req, res, next) => {
  Servers.all((err, servers) => {
    if (err) {
      next(err)
    }
    const list = servers.map(item => item.url).join('\n');
    console.log('source updated result ==> add ' + servers.length + ' servers');
    res.send(base64.encode(list));
  });
});

router.post('/servers/sync', (req, res, next) => {
  updateSource(() => res.send('OK'));
});

router.post('/servers/proxy', (req, res, next) => {
  updateSource(() => res.send('OK'), true);
});

router.get('/server/:id', (req, res, next) => {
  Servers.find(req.params.id, (err, server) => {
    if (err) {
      return next(err);
    }
    res.json(server);
  });
});

router.delete('/servers/:id', (req, res, next) => {
  const id = req.params.id;
  Servers.delete(id, err => {
    if (err) {
      return next(err);
    }
    res.send({message: 'Deleted'});
  })
});

module.exports = router;

// module.exports.polling = minutes => (req, res, next) => {
//     global.setInterval(updateSource, minutes * 60000);
//     next();
// };

