/**
 * Created by chandler on 4/7/17.
 */
var mongoose = require('mongoose');
var cardsetSchema = mongoose.Schema({
    name: { type: String, required: true},
    desc: { type: String},
    whiteCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
    blackCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card'}],
    vendor: { type: String }
});
module.exports = mongoose.model('Cardset', cardsetSchema);
