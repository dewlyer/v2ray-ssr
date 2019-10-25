const base64 = require('js-base64').Base64;
const fs = require('fs');
const Servers = require('../models/db').Server;
const crawler = require('../libs/crawler');

function updateSourceData(cb) {
    console.log('source sync start ==>');
    crawler.getData(data => {
        Servers.clear(() => {
            data.forEach((url, index) => {
                Servers.create({
                    name: index,
                    url: url
                }, (err) => {
                    if (!err) {
                        if (index === data.length - 1) {
                            console.log('source sync success at ' + new Date().toLocaleString());
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

module.exports.polling = minutes => global.setInterval(updateSourceData, minutes * 60000);

module.exports.start = app => {

    app.get('/', (req, res, next) => {
        res.render('index.ejs');
    });

    app.get('/servers', (req, res, next) => {
        Servers.all((err, servers) => {
            if (err) {
                return next(err);
            }
            res.format({
                html: () => {
                    res.render('list.ejs', {servers: servers});
                },
                json: () => {
                    res.send(servers);
                }
            })
        });
    });

    app.get('/servers/:id', (req, res, next) => {
        const id = req.params.id;
        Servers.find(id, (err, server) => {
            if (err) {
                return next(err);
            }
            res.send(server);
        });
    });

    app.get('/servers/v2ray', (req, res, next) => {
        Servers.all((err, servers) => {
            if (err) {
                return next(err);
            }
            const list = servers.map(item => item.url).join('\n');
            console.log('v2ray list updated ' + list.length + ' servers');
            res.send(base64.encode(list));
        });
    });

    app.post('/servers/sync', (req, res, next) => {
        updateSourceData(() => {
            res.send('OK');
        });
    });

    app.delete('/servers/:id', (req, res, next) => {
        const id = req.params.id;
        Servers.delete(id, err => {
            if (err) {
                return next(err);
            }
            res.send({message: 'Deleted'});
        })
    });

};