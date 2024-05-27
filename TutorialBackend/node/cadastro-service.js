const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/hello', (req, res)=>{
    res.send('Hello World')
})

let porta = 8080
app.listen(porta, ()=>{
    console.log('Servidor em execução')
})

const sqlite3 = require('sqlite3')
db = new sqlite3.Database('./dados.db', (err)=>{
    if (err){
        console.log('Um erro aconteceu ao conectar ao banco de dados')
        throw err
    }
    console.log('Conectado ao SQLite!')
})

db.run(`CREATE TABLE IF NOT EXISTS cadastro 
        (nome TEXT NOT NULL, email TEXT NOT NULL, 
         cpf INTEGER PRIMARY KEY NOT NULL UNIQUE)`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });


app.post('/Cadastro', (req, res, next)=>{
    db.run(`INSERT INTO cadastro(nome, email, cpf) VALUES(?,?,?)`,
    [req.body.nome, req.body.email, req.body.cpf], (err) => {
        if (err) {
            console.log("Error: ", err)
            res.status(500).send('Erro ao cadastrar cliente')
        } else {
            console.log('Cliente cadastrado com sucesso!')
            res.status(200).send('Cliente cadastrado com sucesso')
        }
    })
})


app.get('/Cadastro', (req, res, next)=>{
    db.all(`SELECT * FROM cadastro`, [], (err, result) => {
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result)
        }
    })
})

app.get('/Cadastro/:cpf', (req, res, next)=>{
    db.get(`SELECT * FROM cadastro WHERE cpf = ?`, req.params.cpf, (err, result)=>{
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else if (result == null){
            console.log('Cliente não encontrado')
            res.status(404).send('Cliente não encontrado')
        } else {
            res.status(200).json(result)
        }
    })
})


app.patch('/Cadastro/:cpf', (req, res, next) => {
    db.run(`UPDATE cadastro SET nome = COALESCE(?,nome), email = COALESCE(?, email) WHERE cpf = ?`,
    [req.body.nome])
})