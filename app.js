const express = require('express');
const cors = require('cors');
const router = require('./api/routes');
const { PORT } = require('./env');
const { sequelize } = require('./models');

const app = express();

app.set('port', PORT || 3003);

sequelize.sync({ force: true })
    .then(() => {
        console.log('DB connected!');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(cors({
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', router);

app.listen(app.get('port'), () => {
    console.log(`Listening http://localhost:${app.get('port')} in ${app.get('env')} mode !!!`);
});