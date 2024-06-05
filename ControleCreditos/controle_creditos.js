const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


let porta = 8070
app.listen(porta, ()=>{
    console.log('Servidor creditos em execução na porta: ', porta)
})

const sqlite3 = require('sqlite3')
db = new sqlite3.Database('./creditos.db', (err)=>{
    if (err){
        console.log('Um erro aconteceu ao conectar ao banco de dados')
        throw err
    }
    console.log('Conectado ao SQLite!')
})

const axios = require('axios')

db.run(`CREATE TABLE IF NOT EXISTS creditos
        (qtd_creditos INTEGER NOT NULL,
         cpf_usuario INTEGER PRIMARY KEY NOT NULL UNIQUE,
        FOREIGN KEY (cpf_usuario) REFERENCES usuarios(cpf))`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });

//db.run(`CREATE TRIGGER `)

app.post('/Creditos', (req, res, next)=>{
    db.run(`INSERT INTO creditos(qtd_creditos, cpf_usuario) VALUES(?,?)`,
    [req.body.qtd_creditos, req.body.cpf_usuario], (err) => {
        if (err) {
            console.log("Error: ", err)
            res.status(500).send('Erro ao cadastrar creditos')
        } else {
            console.log('Creditos cadastrados com sucesso!')
            res.status(200).send('Creditos cadastrados com sucesso')
        }
    })
})


app.get('/Creditos', (req, res, next)=>{
    db.all(`SELECT * FROM creditos`, [], (err, result) => {
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result)
        }
    })
})

app.get('/Creditos/:cpf_usuario', (req, res, next)=>{
    db.get(`SELECT * FROM creditos WHERE cpf_usuario = ?`, req.params.cpf_usuario, (err, result)=>{
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else if (result == null){
            console.log('Usuário não encontrado')
            res.status(404).send('Usuário não encontrado')
        } else {
            res.status(200).json(result)
        }
    })
})

app.patch('/Creditos/Incrementa/:cpf_usuario', async (req, res, next) => {
    let nova_quantidade_creditos = await axios.get(`http://localhost:8070/Creditos/${req.params.cpf_usuario}`).then((res)=>{return parseInt(res.data.qtd_creditos)}) + parseInt(req.body.qtd_creditos)
    db.run(`UPDATE creditos SET qtd_creditos = ${nova_quantidade_creditos} WHERE cpf_usuario = ?`,
           [req.params.cpf_usuario], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Usuário não encontrado.");
                res.status(404).send('Usuário não encontrado.');
            } else {
                console.log("Nova quantidade de creditos: ", nova_quantidade_creditos)
                res.status(200).send('Usuário alterado com sucesso!');
            }
    });
});

app.patch('/Creditos/Decrementa/:cpf_usuario', async (req, res, next) => {
    let nova_quantidade_creditos = await axios.get(`http://localhost:8070/Creditos/${req.params.cpf_usuario}`).then((res)=>{return res.data.qtd_creditos}) - 1
    db.run(`UPDATE creditos SET qtd_creditos = ? WHERE cpf_usuario = ?`,
           [nova_quantidade_creditos, req.params.cpf_usuario], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Usuário não encontrado.");
                res.status(404).send('Usuário não encontrado.');
            } else {
                console.log("Nova quantidade de creditos: ", nova_quantidade_creditos)
                res.status(200).send('Usuário alterado com sucesso!');
            }
    });
});

app.delete('/Creditos/:cpf_usuario', (req, res, next) => {
    db.run(`DELETE FROM creditos WHERE cpf_usuario = ?`, req.params.cpf_usuario, function(err) {
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
