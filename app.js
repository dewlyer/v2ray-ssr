const bodyParser = require('body-parser');
const express = require('express');

const app = express();
const port = process.env.PROT || 3000;
const articles = [{title: 'Example'}];

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/articles', (req, res, next) => {
    res.send(articles);
});

app.post('/articles', (req, res, next) => {
    const article = { title: req.body.title };
    articles.push(article);
    res.send(article);
});

app.get('/articles/:id', (req, res, next) => {
    const id = req.params.id;
    console.log('Fetching:', id);
    res.send(articles[id]);
});

app.listen(app.get('port'), () => {
    console.log('Express web app available at http://localhost:' + port);
});

module.exports = app;
