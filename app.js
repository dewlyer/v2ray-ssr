const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const mainRouter = require('./routes');
const apiRouter = require('./routes/api');
const app = express();
const port = process.env.port || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/libs/jquery', express.static('node_modules/jquery/dist'));
app.use('/libs/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/', mainRouter);
app.use('/api', apiRouter);
// app.use(api.polling(60));

const listenPort = app.get('port');
app.listen(listenPort, () => {
  console.log(`Server: http://127.0.0.1:${listenPort}`);
});

module.exports = app;
