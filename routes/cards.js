/**
 * Created by chandler on 4/7/17.
 */
var Card = require('../models/card.js');
var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
var Cache = require('../libs/cacheManager.js')

function createCard(req, res, next) {
    card = new Card({
        text: req.body.text,
        draw: req.body.draw || 0,
        pick: req.body.pick || 1,
        type: req.body.type,
        vendor: req.body.vendor || "official"
    });
    card.save(function (err, success) {
        if (err) res.send(503, err);
        if (err) log.error(err);
        res.send(201, success)
    })
}
function readOneCard(req, res, next) {
    Cache.get('card', req.params.id, function(err, card) {
        if (err) res.send(503, err)
        if (card.cacheHit) {res.header('X-Cache','Hit')} else {res.header('X-Cache', 'Miss')}
            res.send(200, card.data)

    })
}
function readAllCards(req, res, next) {
    var query = Card.find();
    if (req.query.text) query.where({text: new RegExp(req.query.text, "i")});
    if (req.query.type) query.where({type: req.query.type});
    query.limit(req.query.limit || 20);
    query.exec(function (err, card) {
        if (err) return next(err);
        if (err) log.error(err);
        res.send(card)
    });
}

PATH = '/api/cards';

module.exports = function(server) {
    server.post({path: PATH, version: '0.0.1'}, createCard);
    server.get({path: PATH, version: '0.0.1'}, readAllCards);
    server.get({path: PATH + '/:id', version: '0.0.1'}, readOneCard);
};