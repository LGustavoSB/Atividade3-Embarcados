// Inicia o Express.js
const express = require('express');
const app = express();

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Inicia o Servidor HTTP na porta 8090
let porta = 8090;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});

// Importa o package do SQLite 
const sqlite3 = require('sqlite3');

// Acessa o arquivo com o banco de dados
var db = new sqlite3.Database('./dados.db', (err) => {
        if (err) {
            console.log('ERRO: não foi possível acessar o banco de dados.');
            throw err;
        }
        console.log('Conectado ao SQLite!');
    });

// Cria a tabela pontos, caso ela não exista
db.run(`CREATE TABLE IF NOT EXISTS pontos 
        (cpf INTEGER PRIMARY KEY NOT NULL UNIQUE, pontos INTEGER NOT NULL)`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });    

// Método HTTP POST /Pontos - cadastra um novo cliente no programa de fidelidade
app.post('/Pontos', (req, res, next) => {
    db.run(`INSERT INTO pontos(cpf, pontos) VALUES(?, 0)`, 
         [req.body.cpf], (err) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao cadastrar cliente no programa.');
        } else {
            console.log('Cliente cadastrado com sucesso!');
            res.status(200).send('Cliente cadastrado com sucesso!');
        }
    });
});

// Método HTTP GET /Pontos - retorna a pontuação de todos os clientes
app.get('/Pontos', (req, res, next) => {
    db.all( `SELECT * FROM pontos`, [], (err, result) => {
        if (err) { 
            console.log("Erro: "+err);
            res.status(500).send('Erro ao obter dados.');
        } else {
            res.status(200).json(result);
        }
    });
});

// Método HTTP GET /Pontos/:cpf - retorna a pontuação do cliente com base no CPF
app.get('/Pontos/:cpf', (req, res, next) => {
    db.get( `SELECT * FROM pontos WHERE cpf = ?`, 
            req.params.cpf, (err, result) => {
        if (err) { 
            console.log("Erro: "+err);
            res.status(500).send('Erro ao obter dados.');
        } else if (result == null) {
            console.log("Cliente não encontrado.");
            res.status(404).send('Cliente não encontrado.');
        } else {
            res.status(200).json(result);
        }
    });
});

// Método HTTP PATCH /Pontos/:cpf - altera a pontuação de um cliente
app.patch('/Pontos/:cpf', (req, res, next) => {
    db.run(`UPDATE pontos SET pontos = ? WHERE cpf = ?`,
           [req.body.pontos, req.params.cpf], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Cliente não encontrado.");
                res.status(404).send('Cliente não encontrado.');
            } else {
                res.status(200).send('Pontuação alterada com sucesso!');
            }
    });
});

//Método HTTP DELETE /Pontos/:cpf - remove um cliente do cadastro
app.delete('/Pontos/:cpf', (req, res, next) => {
    db.run(`DELETE FROM pontos WHERE cpf = ?`, req.params.cpf, function(err) {
      if (err){
         res.status(500).send('Erro ao remover cliente.');
      } else if (this.changes == 0) {
         console.log("Cliente não encontrado.");
         res.status(404).send('Cliente não encontrado.');
      } else {
         res.status(200).send('Cliente removido com sucesso!');
      }
   });
});