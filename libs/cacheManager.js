var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
var Card = require('../models/card.js');
var Cardset = require('../models/cardset.js');

module.exports.get = function(type, id, callback) {
	if (type == "card") {
		redis.get('cache:cards:'+id, function(err,success) {
			if (err) {console.log(err);callback(new Error(err));return;}
			if (success == null) {
				Card.findOne({_id:id}).lean().exec(function(err, card) {
					if (err) {console.log(err);callback(new Error(err));return;}
					redis.set('cache:cards:'+id, JSON.stringify(card))
					redis.expire('cache:cards:'+id, 43200);
					callback(null,{cacheHit:false, data:card})
				})
			} else {
				callback(null,{cacheHit:true, data:success})
			}
		})
	}
	if (type == "cardset") {
		redis.get('cache:cardsets:'+id, function(err,success) {
			if (err) console.log(err)
			if (err) callback(new Error(err))
			if (success == null) {
				Cardset.findOne({_id:id}).lean().exec(function(err, card) {
					if (err) console.log(err)
					if (err) callback(new Error(err))
					redis.set('cache:cardsets:'+id, JSON.stringify(cardset))
					redis.expire('cache:cardsets:'+id, 43200);
					callback({cacheHit:false, data:cardset})
				})
			} else {
				callback({cacheHit:true, data:cardset})
			}
		})
	}
}