var bunyan = require('bunyan');
var restify = require('restify');
var mongoose = require('mongoose');
var Redis = require('ioredis');
var redis = new Redis(process.env.redisUrl);
var log = bunyan.createLogger({name:'triggerwarning'});
var server = restify.createServer({name: 'TriggerWarning-Backend',version: '0.0.1'});
server.listen(process.env.webPort || process.env.PORT || 8080, process.env.webAddress || '0.0.0.0', function() {
    log.info(server.name+' listening at '+server.url);
});
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.pre(restify.CORS());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.throttle({
    burst: 100,
    rate: 75,
    ip: true
}));
server.use(function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
});
mongoose.connect(process.env.mongoUrl, function(err) {
    if (err) log.fatal('Error connecting to MongoDB: ' + err); else log.info('Successfully connected to MongoDB')
});
require('./routes/cards.js')(server);
require('./routes/cardsets.js')(server);