const base64 = require('js-base64').Base64;
const fs = require('fs');
const Articles = require('../models/db').Article;
const crawler = require('../libs/crawler');

function updateSourceData(cb) {
    crawler.getData(data => {
        Articles.clear(() => {
            data.forEach((item, index) => {
                Articles.create({
                    title: index,
                    content: item
                }, (err) => {
                    if (!err) {
                        if (index === data.length - 1) {
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

module.exports.polling = hour => global.setInterval(updateSourceData, hour * 3600000);

module.exports.start = app => {

    app.get('/', (req, res, next) => {
        fs.readFile('./views/index.html', (e, d) => {
            if (e) {
                console.error(e);
                res.end('Server Error');
            } else {
                const tmpl = d.toString();
                res.end(tmpl);
            }
        });
    });

    app.get('/articles', (req, res, next) => {
        Articles.all((err, articles) => {
            if (err) {
                return next(err);
            }
            res.format({
                html: () => {
                    res.render('articles.ejs', {articles: articles});
                },
                json: () => {
                    res.send(articles);
                }
            })
        });
    });

    app.get('/v2ray', (req, res, next) => {
        Articles.all((err, articles) => {
            if (err) {
                return next(err);
            }
            const list = articles.map(item => item.content).join('\n');
            console.log('v2ray list update: \n' + list);
            res.send(base64.encode(list));
        });
    });

    app.get('/articles/:id', (req, res, next) => {
        const id = req.params.id;
        Articles.find(id, (err, article) => {
            if (err) {
                return next(err);
            }
            res.send(article);
        });
    });

    app.post('/update', (req, res, next) => {
        updateSourceData(() => {
            res.send('OK');
        });
    });

    app.delete('/articles/:id', (req, res, next) => {
        const id = req.params.id;
        Articles.delete(id, err => {
            if (err) {
                return next(err);
            }
            res.send({message: 'Deleted'});
        })
    });

};