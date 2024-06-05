const express = require("express")

const app = express()

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


let porta = 8040
app.listen(porta, ()=>{
    console.log('Servidor acesso em execução na porta: ', porta)
})

app.get('/Cancela/Saida', (req, res, )=>{
        console.log('Cancela aberta para saída')
        res.status(200).send('Cancela aberta para saída')
    })

app.get('/Cancela/Entrada', (req, res, )=>{
        console.log('Cancela aberta para entrada')
        res.status(200).send('Cancela aberta para entrada')
    })