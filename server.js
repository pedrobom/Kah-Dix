const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

const jogadores = {}
var deck = []

for (i = 1; i < 13; i++)
    deck.push(`card${i}.png`)

// Escutando em caso de conexão (Abertura do browser)
io.on('connection', function (socket) {
    let id = socket.id
    jogadores[id] = {
        id: socket.id,
        jogador: '',
        hand: '',
        }
    console.log(`O usuário ${socket.id} entou na página `)

    socket.on('nome input', nome => {
        jogadores[id].jogador = nome
        console.log(`O usuário ${socket.id} definiu o nome: ` + jogadores[id].jogador)
    })

    socket.on('chat message', (msg) => {
        console.log(`${jogadores[id].jogador} diz: ${msg}`)
        io.emit('chat message', `${jogadores[id].jogador} diz: ${msg}` )
    })

    socket.on('disconnect', ()=>{
        console.log('user disconnected')
        delete jogadores[id]

    })

    socket.on('requestCards', function () {
        console.log(`${socket.id} fez "requestCards`)
        for (jogadores[id].hand in jogadores) { // problema
            console.log(`dando cartas para o jogador ${jogadores[id].jogador}`) // problema
            let randomCards = []
            for ( let i = 0; i < 5; i++ ) {
            let randomCard = deck[Math.floor(Math.random() * deck.length)]
            randomCards.push(randomCard)                        
            }  
            jogadores[id].hand = randomCards 
        }

            
        console.log(jogadores)
                
        });

    // o Servidor escuta quando um jogador adiciona uma carta no Drop e avisa os outros jogadores.
    socket.on('cardPlayed', function (gameObject, isPlayerA) {
        io.emit('cardPlayed', gameObject);
    });

});

// Ouvir a porta 3000 e conectar com o client.
http.listen(3000, function () {
    console.log('Servidor conectado na porta :3000!');
});