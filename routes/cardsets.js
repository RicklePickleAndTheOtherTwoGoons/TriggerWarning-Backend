/**
 * Created by chandler on 4/7/17.
 */
var Cardset = require('../models/cardset.js');
var Card = require('../models/card.js');
var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
//TODO: dont do this. Properly export logger
var bunyan = require('bunyan');
var log = bunyan.createLogger({name:'triggerwarning'});

function createCardset(req, res, next) {
    cardset = new Cardset({
        name: req.body.name,
        desc: req.body.desc,
        vendor: req.body.pick
    });
    cardset.save(function (err, success) {
        if (err) res.send(503, err);
        if (err) log.error(err);
        res.send(201, success)
    })
}
function addCardToCardset(req,res,next) {
    Cardset.findById(req.params.cardset, function(err,cardset) {
        if (err) res.status(503, err);
        if (err) log.error(err);
        Card.findById(req.params.card, function(err, card) {
            if (err) res.status(503, err);
            if (err) log.error(err);
            if (card.type=="white") {cardset.whiteCards.push(card._id)}
            if (card.type=="black") {cardset.blackCards.push(card._id)}
            cardset.save(function(err,cardsetU) {
                if (err) res.send(503, err)
                if (err) console.log(err)
                res.send(200, cardsetU)
            })
        })
    })
}

function readOneCardset(req, res, next) {
    redis.get('cache:cardsets:'+req.params.id, function(err, success) {
        if (err) log.error(err);
        if (success == null) {
            Cardset.findById(req.params.id, function(err, cardset) {
                if (err) res.status(503, err);
                if (err) log.error(err);
                redis.set('cache:cardsets:'+req.params.id, JSON.stringify(cardset));
                redis.expire('cache:cardsets:'+req.params.id, 43200);
                res.header('X-Cache', 'Miss');
                res.send(200, cardset)
            })
        } else {
            res.header('X-Cache', 'Hit');
            res.send(200, JSON.parse(success))
        }
        res.send(503, 'Request Error')
    })
}
function readAllCardsets(req, res, next) {
    var query = Cardset.find();
    if (req.query.text) query.where({text: new RegExp(req.query.text, "i")});
    query.limit(req.query.limit || 20);
    query.exec(function (err, cardsets) {
        if (err) return next(err);
        if (err) log.error(err);
        res.send(cardsets)
    });
}

PATH = '/api/cardsets';
module.exports = function(server) {
    server.post({path: PATH, version: '0.0.1'}, createCardset);
    server.get({path: PATH, version: '0.0.1'}, readAllCardsets);
    server.get({path: PATH + '/:id', version: '0.0.1'}, readOneCardset);
    server.get({path: PATH+'/:cardset'+'/add'+'/:card', version: '0.0.1'}, addCardToCardset);
};
