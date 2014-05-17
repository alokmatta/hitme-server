
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

app.post('/add', function(req, res){
	console.log("req obj is: ");
	console.dir(req.body);

	var request = req.body;

  mongo.Db.connect(mongo_uri, function (err, db) {
	db.collection('products', function(er, collection) {
		collection.insert(request, {safe: true}, function(er,rs) {
			if (rs) {
				console.log('Inserted into products table!' + rs);
			} else  {
				console.log('Error: ' + er);
			}
		});
	});
	});
	res.send("Inserted Successfully");
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
	db.collection('scanned', function(er, collection) {
		collection.insert(request, {safe: true}, function(er,rs) {
			if (rs) {
				console.log('Inserted into scanned table!' + rs);
			} else  {
				console.log('Error: ' + er);
			}
		});
	});
	});

    mongo.Db.connect(mongo_uri, function (err, db) {
	db.collection('products', function(er, collection) {
		var query = {"product_id" : request["product_id"]};
		collection.findOne(query, function(er,rs) {
			if (rs) {
				res.send(rs);
			} else  {
				res.send("No such product found");
			}
		});
	});
	});
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
				console.dir(request);
				var secondQuery = {"user_id" : request["user_id"], "product_id" : request["product_id"], "wishlist" : true};
				request.wishlist = false;
				request.timestamp = ts;
				collection.update(secondQuery, request, function(er,rs) {
					if (rs) {
						console.log('Updated from true to false!');
						res.send("Moving from wishlist to Bought: " + request["product_id"] + " by user: " + request["user_id"]);
					} else  {
						request.timestamp = ts;
						collection.insert(request, {safe: true}, function(er,rs) {
						if (rs) {
							console.log('New Entry!');
							res.send("Buying again!");
						} else  {
							console.log('Error: ' + er);
						}
				});
					}
				});
				
			} else {

				// braintree shenangians!


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


	}); //ending mongodb.connect
}); // ending buy post request

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
	}); //ending mongodb.connect
}); // ending wishlist post request