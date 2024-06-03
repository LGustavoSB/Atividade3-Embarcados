const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


let porta = 8070
app.listen(porta, ()=>{
    console.log('Servidor usuarios em execução na porta: ', porta)
})

const sqlite3 = require('sqlite3')
db = new sqlite3.Database('./estacionamento.db', (err)=>{
    if (err){
        console.log('Um erro aconteceu ao conectar ao banco de dados')
        throw err
    }
    console.log('Conectado ao SQLite!')
})

db.run(`CREATE TABLE IF NOT EXISTS estacionamento
        (id_estacionamento INT NOT NULL, ds_estacionamento TEXT NOT NULL)`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });


app.post('/Estacionamento', (req, res, next)=>{
    db.run(`INSERT INTO estacionamento(id_estacionamento, ds_estacionamento) VALUES(?,?)`,
    [req.body.id_estacionamento, req.body.ds_estacionamento], (err) => {
        if (err) {
            console.log("Error: ", err)
            res.status(500).send('Erro ao cadastrar estacionamento')
        } else {
            console.log('Estacionamento cadastrado com sucesso!')
            res.status(200).send('Estacionamento cadastrado com sucesso')
        }
    })
})


app.get('/Estacionamentos', (req, res, next)=>{
    db.all(`SELECT * FROM estacionamentos`, [], (err, result) => {
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result)
        }
    })
})

app.get('/Estacionamentos/:id_estacionamento', (req, res, next)=>{
    db.get(`SELECT * FROM estacionamentos WHERE id_estacionamento = ?`, req.params.id, (err, result)=>{
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else if (result == null){
            console.log('Estacionamento não encontrado')
            res.status(404).send('Estacionamento não encontrado')
        } else {
            res.status(200).json(result)
        }
    })
})

app.get('/Estacionamentos/:ds_estacionamento', (req, res, next)=>{
    db.get(`SELECT * FROM estacionamentos WHERE ds_estacionamento = ?`, req.params.ds_estacionamento, (err, result)=>{
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else if (result == null){
            console.log('Estacionamento não encontrado')
            res.status(404).send('Estacionamento não encontrado')
        } else {
            res.status(200).json(result)
        }
    })
})

app.patch('/Estacionamento/:id_estacionamento', (req, res, next) => {
    db.run(`UPDATE estacionamento SET nome = COALESCE(?,ds_estacionamento) WHERE id_estacionamento = ?`,
           [req.body.ds_estacionamento, req.params.id_estacionamento], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Estacionamento não encontrado.");
                res.status(404).send('Estacionamento não encontrado.');
            } else {
                res.status(200).send('Estacionamento alterado com sucesso!');
            }
    });
});


app.delete('/Estacionamento/:id_estacionamento', (req, res, next) => {
    db.run(`DELETE FROM estacionamento WHERE id_estacionamento = ?`, req.params.id_estacionamento, function(err) {
      if (err){
         res.status(500).send('Erro ao remover usuário.');
      } else if (this.changes == 0) {
         console.log("Usuário não encontrado.");
         res.status(404).send('Usuário não encontrado.');
      } else {
         res.status(200).send('Usuário removido com sucesso!');
      }
   });
});