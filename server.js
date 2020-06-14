const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

// jogadores
let games = {};
let game = {}
let players = {};
var cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
var deck = []

for (i = 1; i < 13; i++)
    deck.push(`card${i}.png`)

// Escutando em caso de conexão (Abertura do browser)
io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id); 
    
    //adicionar o código do cliente em players[]
    
    var socketPlayer = players[socket.id] = {
        socket: socket,
        playerId: socket.id,
        game: game,
        hand: []
    };
    console.log(players)

    // O servidor pode escutar quando o client clica no botão 'dealCards'
    // e avisar os outros jogadores que o botão foi pressionado.
    socket.on('requestCards', function () {
        console.log('jogador fez "requestCards"')
        for (player in players) {
            let currentPlayer = players[playerId]
            if (currentPlayer.game == socketPlayer.game) {
                console.log('dando cartas para o jogador %s', playerId)
                let randomCards = []
                for ( let i = 0; i < 5; i++ ) {
                    let randomCard = cards[Math.floor(Math.random() * cards.length)]
                    randomCards.push(randomCard)
                }
                currentPlayer.hand = randomCards
                currentPlayer.socket.emit('dealCards', randomCards)                  
            }   

                
        }
        console.log(currentPlayer.hand)
    });

    // o Servidor escuta quando um jogador adiciona uma carta no Drop e avisa os outros jogadores.
    socket.on('cardPlayed', function (gameObject, isPlayerA) {
        io.emit('cardPlayed', gameObject);
    });

    // O servidor escuta quando um jogador fecha o jogo e deleta o usuário dele da lista de jogadores.
    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        // ERRO players = players.filter(player => player !== socket.id);
    });
});

// Ouvir a porta 3000 e conectar com o client.
http.listen(3000, function () {
    console.log('Server started!');
});