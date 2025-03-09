'use strict'

const srv = require('../services/services');

function isAuth(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'No tienes autorización'});
    }

    const token = req.headers.authorization.split(' ')[1];

    srv.decodeToken(token)
        .then(result => {
            req.body.userId = result;
            next();
        }).catch(error => {
            res.status(403).send({ message: error.message });
        })
}

function whoAmI(){

}

module.exports = { isAuth, whoAmI };