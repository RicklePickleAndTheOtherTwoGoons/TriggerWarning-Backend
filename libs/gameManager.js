/**
 * Created by chandler on 4/7/17.
 */
var Redis = require('ioredis');
var async = require('async');
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

function newGame(socket, cardsets, playerLimit, scoreLimit, callback) {
    var whiteCards = [];
    var blackCards = [];
    var index = 0;

    async.whilst(function() {
        return index < cardsets.length
    }, function(next) {
        Cardset.findById(cardsets[index], function(err, cardset) {
            if (err) console.log(err);
            whiteCards = whiteCards.concat(cardset.whiteCards);
            blackCards = blackCards.concat(cardset.blackCards);
            index++;
            next()
        });
    }, function(err) {
        if (err) console.log(err);
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
                redis.sadd('game:'+game._id+":blackcards", blackCards);
                redis.sadd('game:'+game._id+":whitecards", whiteCards);
                callback(game);
            })
    });
}

function gameJoin(socket, roomCode, callback) {
    Game.findOne({roomCode:roomCode}, function(err, game) {
        if (err) console.log(err);
        if (game==null) {

        } else {
            redis.sadd('game:'+game._id+":activeusers",socket.id);
            callback(game)
        }
    })
}

function gameLeave(socket, game) {
    redis.srem('game:'+game._id+":activeusers", socket.id)
}

function gameStart(socket, game) {
    redis.spop("game:"+game._id+":whitecards", 10, function(err, cards) {
        if (err) console.log(err);
        socket.emit('firstHand', cards)
    })
}

module.exports = function(io) {
    io.on('connection', function (socket) {
        var currentGame = {};
        socket.on('gameCreate', function(data) {
            newGame(socket, data.cardSets, data.playerLimit, data.scoreLimit, function(game) {
                socket.emit('gameCreated', game);
                currentGame = game;
                socket.join(game._id)
            });
        });
        socket.on('gameJoin', function(data) {
            console.log('Recieved game join request');
            gameJoin(socket, data.roomCode, function(game) {
                if (game==null) {
                    socket.emit('error', {text:"Bad room code"})
                } else {
                    socket.emit('targetGame',game);
                    currentGame = game;
                    socket.join(game._id);
                    io.in(game._id).clients(function(err, clients) {
                        if (clients.length == game.playerLimit) {
                            io.in(game._id).emit('gameFull')
                        }
                    })
                }

            })
        });
        socket.on('gameStart', function() {
            console.log('Game start was requested')
        })
        socket.on('disconnect', function(data) {
            gameLeave(socket, currentGame)
        })
    });
};
