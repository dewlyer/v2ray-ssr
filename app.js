const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const port = process.env.PROT || 3000;

routes.start(app);
routes.polling(60);

app.use('/favicon.ico', express.static('favicon.ico'));
app.use('/libs/jquery', express.static('node_modules/jquery/dist'));
app.use('/libs/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('port', port);
app.listen(app.get('port'), () => {
    console.log(`Express web app available at http://localhost:${app.get('port')}/ timestamp: ${new Date().toLocaleString()}`);
});

module.exports = app;
