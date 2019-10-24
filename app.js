const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const port = process.env.PROT || 3000;

routes.start(app);
routes.polling(1);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('port', port);
app.listen(app.get('port'), () => {
    console.log(`Express web app available at http://localhost:${app.get('port')}/`);
});

module.exports = app;
