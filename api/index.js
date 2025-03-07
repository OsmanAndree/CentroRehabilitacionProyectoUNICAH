'use strict'

const db= require('./app/config/db')
const App = require ('./app/app');
require('dotenv').config()

const PORT = process.env.PORT || process.env.APP_PORT;

db.sequelizeInstance.sync()
.then(()=> {
    console.info("Base de Datos Sincronizada");
    App.listen(parseInt(PORT), function (error){
    if(error) return console.error(error);
    console.info(`Server running on port: ${PORT}`);
});
})
.catch(error => console.error(error));

