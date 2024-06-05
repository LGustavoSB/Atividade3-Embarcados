const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const axios = require('axios')

let porta = 8090
app.listen(porta, ()=>{
    console.log('Servidor vagas em execução na porta: ', porta)
})

const sqlite3 = require('sqlite3')
db = new sqlite3.Database('./vagas.db', (err)=>{
    if (err){
        console.log('Um erro aconteceu ao conectar ao banco de dados')
        throw err
    }
    console.log('Conectado ao SQLite!')
})

db.run(`CREATE TABLE IF NOT EXISTS vagas
        (qtd_vagas INTEGER NOT NULL, 
         id_estacionamento INTEGER PRIMARY KEY NOT NULL UNIQUE)`,
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });


app.post('/Vagas', (req, res, next)=>{
    db.run(`INSERT INTO vagas(qtd_vagas, id_estacionamento) VALUES(?,?)`,
    [req.body.qtd_vagas, req.body.id_estacionamento], (err) => {
        if (err) {
            console.log("Error: ", err)
            res.status(500).send('Erro ao cadastrar vagas')
        } else {
            console.log('Vagas cadastrado com sucesso!')
            res.status(200).send('Vagas cadastrado com sucesso')
        }
    })
})


app.get('/Vagas', (req, res, next)=>{
    db.all(`SELECT * FROM vagas`, [], (err, result) => {
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result)
        }
    })
})

app.get('/Vagas/:id_estacionamento', (req, res, next)=>{
    db.get(`SELECT * FROM vagas WHERE id_estacionamento = ?`, req.params.id_estacionamento, (err, result)=>{
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else if (result == null){
            console.log('Vaga não encontrada')
            res.status(404).send('Vaga não encontrada')
        } else {
            res.status(200).json(result)
        }
    })
})


app.patch('/Vagas/:id_estacionamento', (req, res, next) => {
    db.run(`UPDATE vagas SET qtd_vagas = COALESCE(?,qtd_vagas) WHERE id_estacionamento = ?`,
           [req.body.qtd_vagas, req.body.id_estacionamento], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Vaga não encontrada.");
                res.status(404).send('Vaga não encontrada.');
            } else {
                res.status(200).send('Vagas alterado com sucesso!');
            }
    });
});

app.patch('/Vagas/LiberaVaga/:id_estacionamento', async (req, res, next) => {
    let nova_qtd_vagas = await axios.get(`http://localhost:8090/Vagas/${req.params.id_estacionamento}`).then((res)=>{return res.data.qtd_vagas}) + 1
    db.run(`UPDATE vagas SET qtd_vagas = ${nova_qtd_vagas} WHERE id_estacionamento = ?`,
           [req.params.id_estacionamento], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Vaga não encontrado.");
                res.status(404).send('Vaga não encontrado.');
            } else {
                res.status(200).send('Vaga alterado com sucesso!');
            }
    });
});

app.patch('/Vagas/OcupaVaga/:id_estacionamento', async (req, res, next) => {
    let nova_qtd_vagas = await axios.get(`http://localhost:8090/Vagas/${req.params.id_estacionamento}`).then((res)=>{return res.data.qtd_vagas}) - 1
    db.run(`UPDATE vagas SET qtd_vagas = ${nova_qtd_vagas} WHERE id_estacionamento = ?`,
           [req.params.id_estacionamento], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Vaga não encontrado.");
                res.status(404).send('Vaga não encontrado.');
            } else {
                res.status(200).send('Vaga alterado com sucesso!');
            }
    });
});

app.delete('/Vagas/:id_estacionamento', (req, res, next) => {
    db.run(`DELETE FROM vagas WHERE id_estacionamento = ?`, req.params.id_estacionamento, function(err) {
      if (err){
         res.status(500).send('Erro ao remover vaga.');
      } else if (this.changes == 0) {
        console.log("Vaga não encontrado.");
        res.status(404).send('Vaga não encontrado.');
      } else {
        res.status(200).send('Vaga removido com sucesso!');
      }
   });
});