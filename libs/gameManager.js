/**
 * Created by chandler on 4/7/17.
 */
var Game = require('../models/game.js');
var Cardset = require('../models/cardset.js');

//TODO: Ensure that there isn't a roomcode collision with another active game
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for( var i=0; i < 4; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

console.log(makeid());

function newGame(socket, cardsets, playerLimit, scoreLimit) {
    var whiteCards = [];
    var blackCards = [];
    console.log("Socket ID: "+socket.id);
    for (var i=0;i<cardsets.length;i++) {
        Cardset.findById(cardsets[i], function(err, cardset) {
            if (err) console.log(err);
            whiteCards.push(cardset.whiteCards);
            blackCards.push(cardset.blackCards);
        })
    }
    game = new Game({
        activeCardsets: cardsets,
        whiteCards: whiteCards,
        blackCards: blackCards,
        scoreLimit: scoreLimit || 10,
        playerLimit: playerLimit || 10,
        host: socket.id,
        roomCode: makeid()
    }).save(function (err, game) {
            if (err) console.log(err);
            socket.emit('gameCreated', game)
        })
}


module.exports = function(io) {
    io.on('connection', function (socket) {
        socket.on('gameCreate', function(data) {
            newGame(socket, data.cardsets, data.playerLimit, data.scoreLimit);
        })
    });
};
