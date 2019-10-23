const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PROT || 3000;
const Articles = require('./db').Article;
const crawler = require('./crawler');

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res, next) => {
    fs.readFile('./index.html', (e, d) => {
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
        console.log(articles);
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
    crawler.getData(data => {
        Articles.clear(() => {
            data.forEach((item, index) => {
                Articles.create({
                    title: index,
                    content: item
                }, (err) => {
                    if (!err) {
                        if (index === data.length - 1) {
                            res.send('OK');
                        }
                    } else {
                        console.log(err);
                    }
                });
            });
        });
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

app.listen(app.get('port'), () => {
    console.log(`Express web app available at http://localhost:${app.get('port')}/articles`);
});

module.exports = app;
