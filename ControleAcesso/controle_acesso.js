const express = require("express")
const axios = require('axios');

const axios = require('axios');

const app = express()

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


let porta = 8080
app.listen(porta, ()=>{
    console.log('Servidor acesso em execução na porta: ', porta)
})

const sqlite3 = require('sqlite3')
db = new sqlite3.Database('./acesso.db', (err)=>{
    if (err){
        console.log('Um erro aconteceu ao conectar ao banco de dados')
        throw err
    }
    console.log('Conectado ao SQLite!')
})

db.run(`CREATE TABLE IF NOT EXISTS acesso
        (id_estacionamento INT, cpf_usuario INT,tipo_acesso TEXT NOT NULL)`, 
db.run(`CREATE TABLE IF NOT EXISTS acesso
        (id_estacionamento INT, cpf_usuario INT,tipo_acesso TEXT NOT NULL)`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      }
);

function getIdestacionamento(ds_estacionamento) {
    const porta_estacionamento = 80
    return axios.get(`http://localhost:${porta_estacionamento}/Estacionamento/${ds_estacionamento}`)
}

function getVagasEstacionamento(id_estacionamento){
    const porta_vagas = 90
    return axios.get(`http://localhost:${porta_vagas}/Vagas/${id_estacionamento}`)
}

app.post('/Entrar/:ds_estacionamento', (req, res, next)=>{

    var id_estacionamento = getIdestacionamento(req.body.ds_estacionamento);
    var vagas = getVagasEstacionamento(id_estacionamento);

    if (vagas > 0){
        db.run(`INSERT INTO acesso(id_estacionamento, cpf_usuario,tipo_acesso) VALUES(?,?,?)`,
        [id_estacionamento, req.body.cpf_usuario,'entrada'], (err) => {
            if (err) {
                console.log("Error: ", err)
                res.status(500).send('Erro ao entrar');
            } else {
                res.status(200).send('Usuário entrou com sucesso');
            }
        })
    }
})
