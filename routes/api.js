const router = require('express').Router();
const base64 = require('js-base64').Base64;
const Servers = require('../models/db').Server;
const Services = require('../libs/services');

function updateSourceData(cb) {
    Services.updateSourceData(data => {
        Servers.clear(() => {
            data.forEach((item, index) => {
                Servers.create(item, (err) => {
                    if (!err) {
                        if (index === data.length - 1) {
                            console.log('source sync end ==> ' + new Date().toLocaleString());
                            cb && cb();
                        }
                    } else {
                        console.log(err);
                    }
                });
            });
        });
    });
}

function getSourceRss(cb, error) {
    Servers.all((err, servers) => {
        if (err) {
            return error(err);
        }
        const list = servers.map(item => item.url).join('\n');
        console.log('source updated result ==> add ' + servers.length + ' servers');
        cb(list);
    });
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
    getSourceRss(list => {
        res.send(base64.encode(list));
    }, err => {
        next(err)
    });
});
router.get('/server/:id', (req, res, next) => {
    Servers.find(req.params.id, (err, server) => {
        if (err) {
            return next(err);
        }
        res.json(server);
    });
});
router.post('/servers/sync', (req, res, next) => {
    updateSourceData(() => res.send('OK'));
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
//     global.setInterval(updateSourceData, minutes * 60000);
//     next();
// };

