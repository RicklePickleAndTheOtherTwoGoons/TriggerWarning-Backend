/**
 * Created by chandler on 4/7/17.
 */
var mongoose = require('mongoose');
var gameSchema = mongoose.Schema({
    activeCardSets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cardset'}],
    whiteCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
    blackCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
    host: {type:String},
    roomCode: {type:String},
    rounds: [{
        roundNumber: {type:Number},
        blackCard: {type:mongoose.Schema.Types.ObjectId, ref: 'Card'},
        userSubmissions: [{
            user: {type: String},
            whiteCard: {type:mongoose.Schema.Types.ObjectId, ref: 'Card'},
            czarPick: {type:Boolean}
        }]
    }],
    roundStart: {type:Date, default: Date.now()},
    roundEnd: {type: Date},
    scoreLimit: {type:Number, default: 10},
    playerLimit: {type:Number, default: 8},
    completed: {type:Boolean}
});
module.exports = mongoose.model('Game', gameSchema);