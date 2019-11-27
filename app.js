const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const router = require('./routes');
const api = require('./routes/api');
const app = express();
const port = process.env.PROT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs/jquery', express.static('node_modules/jquery/dist'));
app.use('/libs/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/', router);
app.use('/api', api);
// app.use(api.polling(60));

app.listen(app.get('port'), () => {
    console.log(`Server: http://127.0.0.1:${app.get('port')}`);
});

module.exports = app;
