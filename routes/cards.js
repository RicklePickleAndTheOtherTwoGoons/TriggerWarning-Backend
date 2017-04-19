/**
 * Created by chandler on 4/7/17.
 */
var Card = require('../models/card.js');
var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
var Cache = require('../libs/cacheManager.js')

Cache.get("card", "58e89f8746d21c0011cf546a", function(err, data) {
    if (err) console.log(err)
    console.log(data)
})

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
    redis.get('cache:cards:'+req.params.id, function(err, success) {
        if (err) log.error(err);
        if (err) res.send(503, 'Request Error')
        if (success == null) {
            Card.findById(req.params.id, function(err, card) {
                if (err) res.status(503, err);
                if (err) log.error(err);
                redis.set('cache:cards:'+req.params.id, JSON.stringify(card));
                redis.expire('cache:cards:'+req.params.id, 43200);
                res.header('X-Cache', 'Miss');
                res.send(200, card)
            })
        } else {
            res.header('X-Cache', 'Hit');
            res.send(200, JSON.parse(success))
        }
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