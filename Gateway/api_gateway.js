const httpProxy = require('express-http-proxy');
const express = require('express');
const app = express();
var logger = require('morgan');

app.use(logger('dev'));

function selectProxyHost(req) {
    if (req.path.startsWith('/Acesso'))
        return 'http://localhost:8060/';
    else if (req.path.startsWith('/Creditos'))
        return 'http://localhost:8070/';
    else if (req.path.startsWith('/Usuarios'))
        return 'http://localhost:8080/';
    else if (req.path.startsWith('/Vagas'))
        return 'http://localhost:8090/';
    else return null;
}

app.use((req, res, next) => {
    var proxyHost = selectProxyHost(req);
    if (proxyHost == null)
        res.status(404).send('Not found');
    else
        httpProxy(proxyHost)(req, res, next);
});

app.listen(8000, () => {
    console.log('API Gateway iniciado!');
});