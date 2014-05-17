
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

  var d = new Date();
  var hour = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  var ts = hour + ":" + minutes + ":" + seconds;
  console.log("The time is: " + ts);

	var request = req.body;
	request.timestamp = ts;

  mongo.Db.connect(mongo_uri, function (err, db) {
	db.collection('mydocs', function(er, collection) {
		collection.insert(request, {safe: true}, function(er,rs) {
			if (rs) {
				console.log('Success!' + rs);
			} else  {
				console.log('Error: ' + er);
			}
		});
	});
	});

  	var response = {
		"_id": {
		"$oid": "5377916de4b0e6e62941c4f3"
		},
		"product_id": "101",
		"product": "Multi-coloured t-shirt",
		"cost": "£20.00"
		}
	
	res.send(response);
});

app.post('/buy', function(req, res){
	console.log("User wants to BUY");
	console.dir(req.body);

  var d = new Date();
  var hour = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  var ts = hour + ":" + minutes + ":" + seconds;
  console.log("The time is: " + ts);

	var request = req.body;
	request.wishlist = false;
	request.timestamp = ts;

  mongo.Db.connect(mongo_uri, function (err, db) {
	db.collection('user_action', function(er, collection) {
		var query = {"user_id" : request["user_id"], "product_id" : request["product_id"]};
		collection.findOne(query, function(er, rs) {
			if(rs) {



				console.log('Found in user_action');
				request.wishlist = true;
				collection.update(request, {"wishlist": false}, function(er,rs) {
					if (rs) {
						console.log('Updated from true to false!');
					} else  {
						console.log('Error: ' + er);
					}
				});
				res.send("Moving from wishlist to Bought: " + request["product_id"] + " by user: " + request["user_id"]);
			






			} else {
				collection.insert(request, {safe: true}, function(er,rs) {
					if (rs) {
						console.log('Inserted!');
					} else  {
						console.log('Error: ' + er);
					}
				});
			res.send("Bought: " + request["product_id"] + " by user: " + request["user_id"]);
			}
		});
	});


	});
	
	
});

app.post('/wishlist', function(req, res){
	console.log("User is POOR and wants to put in wishlist");
	console.dir(req.body);

  var d = new Date();
  var hour = d.getHours();
  var minutes = d.getMinutes();
  var seconds = d.getSeconds();
  var ts = hour + ":" + minutes + ":" + seconds;
  console.log("The time is: " + ts);

	var request = req.body;
	request.wishlist = true;
	request.timestamp = ts;

  mongo.Db.connect(mongo_uri, function (err, db) {
	db.collection('user_action', function(er, collection) {
		var query = {"user_id" : request["user_id"], "product_id" : request["product_id"]};
		collection.findOne(query, function(er, rs) {
			if(rs) {
				console.log('Found in user_action');
				res.send("This is already in your wishlist... go and get some MONEY!"); 
			} else {
				collection.insert(request, {safe: true}, function(er,rs) {
					if (rs) {
						console.log('Success!');
						res.send("Added to wishlist: " + request["product_id"] + " by user: " + request["user_id"]);
					} else  {
						console.log('Error: ' + er);
					}
				});
			}
		});
	});
	});
});