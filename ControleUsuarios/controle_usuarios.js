const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


let porta = 8080
app.listen(porta, ()=>{
    console.log('Servidor usuarios em execução na porta: ', porta)
})

const sqlite3 = require('sqlite3')
db = new sqlite3.Database('./usuarios.db', (err)=>{
    if (err){
        console.log('Um erro aconteceu ao conectar ao banco de dados')
        throw err
    }
    console.log('Conectado ao SQLite!')
})

db.run(`CREATE TABLE IF NOT EXISTS usuarios
        (nome TEXT NOT NULL, categoria TEXT NOT NULL CHECK(categoria in ('estudante', 'professor', 'TAE', 'visitante')), 
         cpf INTEGER PRIMARY KEY NOT NULL UNIQUE )`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });


app.post('/Usuarios', (req, res, next)=>{
    db.run(`INSERT INTO usuarios(nome, categoria, cpf) VALUES(?,?,?)`,
    [req.body.nome, req.body.categoria, req.body.cpf], (err) => {
        if (err) {
            console.log("Error: ", err)
            res.status(500).send('Erro ao cadastrar usuário')
        } else {
            console.log('Usuário cadastrado com sucesso!')
            res.status(200).send('Usuário cadastrado com sucesso')
        }
    })
})


app.get('/Usuarios', (req, res, next)=>{
    db.all(`SELECT * FROM usuarios`, [], (err, result) => {
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result)
        }
    })
})

app.get('/Usuarios/:cpf', (req, res, next)=>{
    db.get(`SELECT * FROM usuarios WHERE cpf = ?`, req.params.cpf, (err, result)=>{
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


app.patch('/Usuarios/:cpf', (req, res, next) => {
    db.run(`UPDATE usuarios SET nome = COALESCE(?,nome), categoria = COALESCE(?,categoria) WHERE cpf = ?`,
           [req.body.nome, req.body.categoria, req.params.cpf], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.changes == 0) {
                console.log("Usuário não encontrado.");
                res.status(404).send('Usuário não encontrado.');
            } else {
                res.status(200).send('Usuário alterado com sucesso!');
            }
    });
});


app.delete('/Usuarios/:cpf', (req, res, next) => {
    db.run(`DELETE FROM usuarios WHERE cpf = ?`, req.params.cpf, function(err) {
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