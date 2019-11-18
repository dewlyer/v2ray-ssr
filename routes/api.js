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

function updateSourceData(cb) {
    Services.updateSourceData((data, all) => {
        const list = [].concat(all.map((item, index) => ({name: `urla10${index + 1}`, url: item || ''})), data);
        list.sort((a, b) => (a.name.slice(-3) - b.name.slice(-3)));
        Servers.clear(() => {
            updateSourceByEachItem(list, () => {
                console.log('source sync end ==> ' + new Date().toLocaleString());
                if(typeof cb === 'function') {
                    cb();
                }
            });
            // const pList = list.map(item => updateDataBase(item));
            // Promise.all(pList).then(() => {
            //     console.log('source sync end ==> ' + new Date().toLocaleString());
            //     cb && cb();
            // });
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
        updateSourceData();
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

