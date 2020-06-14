import Phaser from "phaser";
import io from 'socket.io-client';
import Zone from './zone';

// configurações padrões do Setup do Phaser
const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1280,
  height: 880,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

// espaço para carregar tudo que é necessário para o jogo.
function preload() {
  this.load.image('bg_menu', "src/assets/bg_menu.png")
  this.load.image("logo", "src/assets/logo.png");
  this.load.atlas('cards', 'src/assets/decksprites.png', 'src/assets/decksprites.json');
}

// function create () = é um espaço para Tudo que é ativado quando começa o jogo
function create() {
  this.add.image(0,0, 'bg_menu').setOrigin(0,0)

  // definindo um socket para ouvir a porta 3000 ( uma forma de se conectar com o arquivo server.js)
  this.socket = io('http://localhost:3000');

  // apenas um Ping-Pong para testar se a conexão Client/Server foi estabelecida  
  this.socket.on('connect', function () {
    console.log('Socket on client Connected!');
  });
  // Variável pra alguma função funcionar (não entendi muito bem)
  var self = this
  
  // Adicionar texto
  this.playerStartText = this.add.text(500, 100, ['Aguardando { player.nome } iniciar a partida']).setFontSize(23).setFontFamily('Trebuchet MS').setColor('#00ffff').setInteractive();
  // Adicionar um texto 'Distribuir Cartas' na tela do jogo
  this.dealText = this.add.text(75, 350, ['Distribuir Cartas']).setFontSize(18).setFontFamily('Trebuchet MS').setColor('#00ffff').setInteractive();
  
  // Quando clicar no texto 'Distribuir Cartas'
  this.dealText.on('pointerup', function () {
        console.log('pedindo cartas para server.js')
        self.socket.emit('requestCards'); // Avisar a todos os jogadores que o botão 'dealCards foi pressionado.
        self.dealText.setColor('#808080')
        self.dealText.disableInteractive();
      })
  // Quando o cliente ouvir que algum socket apertou o botão 'dealCards'
  this.socket.on('dealCards', function (cards) {
        console.log('recebi cartas do servidor')
        self.dealCards(cards); // dispara a função 'dealCards'
        self.dealText.setColor('#808080')
        self.dealText.disableInteractive(); // Desabilita o botão e muda a cor do botão.
  })

    // Quando passar o mouse em cima do texto
    this.dealText.on('pointerover', function () {
        self.dealText.setColor('#ff69b4');
    })
    // Quando sair com o mouse de cima
    this.dealText.on('pointerout', function () {
        self.dealText.setColor('#00ffff');
    })
  //Criar deck de cartas a partir dos sprites pré carregados //
  var deck = this.textures.get('cards').getFrameNames();
  console.log('esse é o deck inicial', deck);

  //posição das cartas para os jogadores //
  var x = 150;
  var y = 600;

  // método para distribuir as cartas. (INCOMPLETO) (acionado ali em cima this.dealtext.on('pointerdown'))  
  this.dealCards = (cards) => {
      console.log('exibindo as cartas na mão do jogador', cards)
      cards.forEach(index => {
         let randomCard = deck[index - 1]
          let cardpick = this.add.image(x, y, 'cards', randomCard).setInteractive();
          deck.splice(deck.indexOf(randomCard), 1)
          x += 250;
          this.input.setDraggable(cardpick); 
          
      })
    
          
  }
  
  // Controlar o drag(puxar o objeto com o mouse clicado) das cartas com o mouse
  this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX; // Verificar na documentação se o gameObject é o input mais próximo. eu li algo assim. Falta definir melhor.
      gameObject.y = dragY;
  })

  // Criar zona de jogar as cartas (Retangulo rosa)
  this.zone = new Zone(this);
  this.dropZone = this.zone.renderZone();
  this.outline = this.zone.renderOutline(this.dropZone);
  
  // Adicionar configurações ao mover as cartas que você tem na mão (Mudar de cor e trazer pra frente)
  this.input.on('dragstart', function (pointer, gameObject) {
    gameObject.setTint(0xff69b4);
    self.children.bringToTop(gameObject);
})

// Caso o jogador erre a zona de Drop a carta deve voltar para a mão dele.
this.input.on('dragend', function (pointer, gameObject, dropped) {
    gameObject.setTint();
    if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
    }
})

// Caso o jogador coloque a carta dentro do retangulo rosa.
this.input.on('drop', function (pointer, gameObject, dropZone) {
    dropZone.data.values.cards++;
    gameObject.x = (dropZone.x - 350) + (dropZone.data.values.cards * 250 - 250);
    gameObject.y = dropZone.y;
    gameObject.disableInteractive();
    self.socket.emit('cardPlayed', gameObject); // Avisa a todos os jogadores que uma carta foi Dropada (adicionada no DropZone)
})

// Escuta para Adicionar código para exibir a carta que o jogador adicionou no DropZone
this.socket.on('cardPlayed', function (gameObject, isPlayerA) {

})

  // adicionar o logo no topo da tela
  const logo = this.add.image(100, 150, "logo");

  // animar o logo movendo pra cima e pra baixo
  this.tweens.add({
    targets: logo,
    y: 200,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });


}
