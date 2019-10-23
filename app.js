const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PROT || 3000;
const Articles = require('./db').Article;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/articles', (req, res, next) => {
    Articles.all((err, articles) => {
        if (err) {
            return next(err);
        }
        res.send(articles);
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

app.post('/articles', (req, res, next) => {
    const article = { title: req.body.title };
    // articles.push(article);
    res.send(article);
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
    console.log('Express web app available at http://localhost:', app.get('port'));
});

module.exports = app;
