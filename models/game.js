/**
 * Created by chandler on 4/7/17.
 */
var mongoose = require('mongoose');
var gameSchema = mongoose.Schema({
    activeCardSets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cardset'}],
    whiteCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
    blackCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
    rounds: [{
        roundNumber: {type:number},
        blackCard: {type:mongoose.Schema.Types.ObjectId, ref: 'Card'},
        userSubmissions: [{
            user: {type: string},
            whiteCard: {type:mongoose.Schema.Types.ObjectId, ref: 'Card'},
            czarPick: {type:bool}
        }]
    }],
    roundStart: {type:date, default: Date.now()},
    roundEnd: {type: date},
    scoreLimit: {type:number, default: 10},
    playerLimit: {type:number, default: 8},
    completed: {type:bool}
});
module.exports = mongoose.model('Game', gameSchema);