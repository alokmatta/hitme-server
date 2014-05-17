
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var pg = require('pg');
var mongo = require('mongodb');
var app = express();
var mongo_uri = process.env.MONGOLAB_URI;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('**Server env variable is: ' + process.env.MONGOLAB_URI );
});

app.post('/scanned', function(req, res){
	console.log("req obj is: ");
	console.dir(req.body);

  mongo.Db.connect(mongo_uri, function (err, db) {
	db.collection('mydocs', function(er, collection) {
		collection.insert(req.body, {safe: true}, function(er,rs) {
			if (rs) {
				console.log('Success!' + rs);
			} else  {
				console.log('Error: ' + er);
			}
		});
	});
	});
	
	res.send("hello");
});
	 