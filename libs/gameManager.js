/**
 * Created by chandler on 4/7/17.
 */
var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
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

function newGame(socket, cardsets, playerLimit, scoreLimit) {
    var whiteCards = [];
    var blackCards = [];
    for (var i=0;i<cardsets.length;i++) {
        Cardset.findById(cardsets[i], function(err, cardset) {
            if (err) console.log(err);
            console.log(cardset.whiteCards.length);
            console.log(cardset.blackCards.length);
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
            redis.sadd('game:'+game._id+":blackcards", blackCards);
            redis.sadd('game:'+game._id+":whitecards", whiteCards);
            if (err) console.log(err);
            socket.emit('gameCreated', game)
        })
}


module.exports = function(io) {
    io.on('connection', function (socket) {
        socket.on('gameCreate', function(data) {
            newGame(socket, data.cardSets, data.playerLimit, data.scoreLimit);
        })
    });
};
