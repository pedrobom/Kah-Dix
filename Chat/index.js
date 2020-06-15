const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const jogadores = {}


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {    
  
    let id = socket.id
    jogadores[id] = {
        id: socket.id,
        jogador: "Usuário Não Cadastrado"
    }
    console.log('A user connected: ' + id)

    socket.on('nome input', nome => {
        jogadores[id].jogador = nome
        console.log(jogadores)
    })

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg)
        let nomeJogador = jogadores[id].jogador
        console.log(nomeJogador)

        io.emit('chat message', `${nomeJogador} diz: ${msg}` )
    })

    socket.on('disconnect', ()=>{
        console.log('user disconnected')
        delete jogadores[id]

    })
})

http.listen(3000, () => {
    console.log('listening on *:3000')
})

