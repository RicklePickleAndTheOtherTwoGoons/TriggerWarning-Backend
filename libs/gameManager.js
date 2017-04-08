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

function newGame(socket, cardsets, scorelimit) {
    var whiteCards = [];
    var blackCards = [];
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
        scoreLimit: scorelimit || 10,
        host: socket.id,
        roomCode: makeid()
    }).save(function (err, game) {
            if (err) console.log(err);
            console.log('We made a game: '+game);
            return game
        })
}
var test={};
test.id = "4938uf89uwfe";


newGame(test,["58e84898d4a1ab001158fc25"]);



module.exports = function(io) {
    io.on('connection', function (socket) {
        console.log('New socket connection: '+socket);
        socket.on('roomCreate', function(data) {
            console.log(data);
            socket.emit(newGame(socket,data.cardsets,data.playerLimit))
        })
    });
};
