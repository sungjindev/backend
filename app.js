const express = require('express');
const router = require('./api/routes');
const { PORT, NODE_ENV } = require('./env');

const app = express();

app.set('port', PORT || 3003);

app.use('/', router);

app.listen(app.get('port'), () => {
    console.log(`Listening http://localhost:${app.get('port')} in ${app.get('env')} mode !!!`);
});