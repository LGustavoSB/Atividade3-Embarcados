const express = require("express")
const axios = require('axios');

const app = express()

const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


let porta = 8060
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
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      }
);

async function getIdestacionamento(ds_estacionamento) {
    const porta_estacionamento = 8050;
    try {
        const response = await axios.get(`http://localhost:${porta_estacionamento}/get_estacionamento_ds/${ds_estacionamento}`);
        return response.data.id_estacionamento;
    } catch (error) {
        throw new Error('Failed to get estacionamento ID');
    }
}

async function getVagasEstacionamento(id_estacionamento) {
    const porta_vagas = 8090;
    try {
        const response = await axios.get(`http://localhost:${porta_vagas}/Vagas/${id_estacionamento}`);
        return response.data.qtd_vagas;
    } catch (error) {
        throw new Error('Failed to get vagas');
    }
}

app.post('/Acesso/Entrar', async (req, res, next) => {
    try {
        const id_estacionamento = await getIdestacionamento(req.body.ds_estacionamento);
        const vagas = await getVagasEstacionamento(id_estacionamento);
        if (vagas > 0) {
            db.run(`INSERT INTO acesso(id_estacionamento, cpf_usuario, tipo_acesso) VALUES(?,?,?)`,
                [id_estacionamento, req.body.cpf_usuario, 'entrar'], (err) => {
                    if (err) {
                        console.log("Error: ", err);
                        res.status(500).send('Erro ao entrar');
                    } else {
                        axios.patch(`http://localhost:8090/Vagas/OcupaVaga/${id_estacionamento}`)
                        axios.get(`http://localhost:8040/Cancela/Entrada`) 
                        res.status(200).send('Usuário entrou com sucesso');
                    }
                });
        } else {
            res.status(400).send('Sem vagas disponíveis');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a solicitação');
    }
});

async function getCreditosUsuario(cpf_usuario){
    const porta_creditos = 8070
    try {
        const res = await axios.get(`http://localhost:${porta_creditos}/Creditos/${cpf_usuario}`);
        return res.data.qtd_creditos;
    } catch (error) {
        throw new Error('Failed to get creditos');
    }
}

async function getCategoriaUsuario(cpf_usuario){
    const porta_usuario = 8080
    try {
        const res = await axios.get(`http://localhost:${porta_usuario}/Usuarios/${cpf_usuario}`)
        return res.data.categoria
    } catch (error) {
        throw new Error('Failed to get categoria');
    }
}
app.post('/Acesso/Sair', async (req, res, next) => {
    try {
        const id_estacionamento = await getIdestacionamento(req.body.ds_estacionamento);
        const creditos = await getCreditosUsuario(req.body.cpf_usuario);
        const categoria = await getCategoriaUsuario(req.body.cpf_usuario)

        if (creditos > 0 || categoria == 'professor' || categoria == 'TAE') {
            db.run(`INSERT INTO acesso(id_estacionamento, cpf_usuario, tipo_acesso) VALUES(?,?,?)`,
                [id_estacionamento, req.body.cpf_usuario, 'saida'], (err) => {
                    if (err) {
                        console.log("Error: ", err);
                        res.status(500).send('Erro ao sair');
                    } else {
                        if(categoria != 'professor' || categoria != 'TAE'){
                            axios.patch(`http://localhost:8070/Creditos/Decrementa/${req.body.cpf_usuario}`)
                        }
                        axios.patch(`http://localhost:8090/Vagas/LiberaVaga/${id_estacionamento}`)
                        axios.get(`http://localhost:8040/Cancela/Saida`)
                        res.status(200).send('Usuário saiu com sucesso');
                    }
                });
        } else {
            res.status(400).send('Sem creditos, favor comprar');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao processar a solicitação');
    }
});

app.get('/Acesso', (req, res, next)=>{
    db.all(`SELECT * FROM acesso`, [], (err, result) => {
        if (err){
            console.log('Erro: ', err)
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result)
        }
    })
})
