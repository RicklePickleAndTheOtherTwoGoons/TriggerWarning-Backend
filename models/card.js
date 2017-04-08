/**
 * Created by chandler on 4/7/17.
 */
var mongoose = require('mongoose');
var cardSchema = mongoose.Schema({
    text: { type: String, required: true},
    draw: { type: Number },
    pick: { type: Number },
    type: { type: String },
    vendor: { type: String }
});
module.exports = mongoose.model('Card', cardSchema);
