/**
 * Created by chandler on 4/7/17.
 */
var Card = require('../models/cardset.js');
var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
function createCardset(req, res, next) {
    Card.find({ migrateId: req.body.migrateId, type: req.body.type }, function(err, result){
        if (err) log.error(err);
        if (result.length>0) {
            res.send(409,'A card with that migrateId of the same type already exists')
        } else {
            card = new Card({
                text: req.body.text,
                draw: req.body.draw || 0,
                pick: req.body.pick || 1,
                watermark: req.body.watermark || '',
                type: req.body.type,
                vendor: req.body.vendor
            });
            card.save(function (err, success) {
                if (err) res.send(503, err);
                if (err) log.error(err);
                res.send(201, success)
            })
        }
    })
}
function readOneCardset(req, res, next) {
    redis.get('cache:cardsets:'+req.params.id, function(err, success) {
        if (err) log.error(err)
        if (success == null) {
            Card.findById(req.params.id, function(err, card) {
                if (err) res.status(503, err)
                if (err) log.error(err)
                redis.set('cache:cardsets:'+req.params.id, JSON.stringify(card))
                redis.expire('cache:cardsets:'+req.params.id, 43200)
                res.header('X-Cache', 'Miss')
                res.send(200, card)
            })
        } else {
            res.header('X-Cache', 'Hit')
            res.send(200, JSON.parse(success))
        }
        res.send(503, 'Request Error')
    })
}
function readAllCardsets(req, res, next) {
    var query = Card.find();
    if (req.query.watermark) {
        query.where({type: 'black'})
        query.where({watermark: new RegExp(req.query.watermark, "i")})
    }
    if (req.query.migrateId) query.where({migrateId: req.query.migrateId})
    if (req.query.text) query.where({text: new RegExp(req.query.text, "i")})
    if (req.query.type) query.where({type: req.query.type});
    query.limit(req.query.limit || 20)
    query.exec(function (err, card) {
        if (err) return next(err);
        if (err) log.error(err)
        res.send(card)
    });
}

PATH = '/api/cardsets';
module.exports = function(server) {
    server.post({path: PATH, version: '0.0.1'}, createCardset);
    server.get({path: PATH, version: '0.0.1'}, readAllCardsets);
    server.get({path: PATH + '/:id', version: '0.0.1'}, readOneCardset);
};
