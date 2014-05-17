
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var pg = require('pg');
var app = express();

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
  console.log('**Server env variable is: ' + process.env.DATABASE_URL);
  
  pg.connect(process.env.DATABASE_URL, function(err, client) {
		 var query = client.query('SELECT * FROM hitme_user;');
		 console.log('**Running Query');
		 console.log('**query: ' + query);
		 query.on('last_name', function(row) {
			console.log('**About to show JSON stringy');
		   console.log(JSON.stringify(row));
		 });
		});
});



pg.connect(process.env.DATABASE_URL, function(err, client) {
	 var query = client.query('SELECT * FROM hitme_user;');
	 console.log('**Running Query');
	 query.on('last_name', function(row) {
		console.log('**About to show JSON stringy');
	   console.log(JSON.stringify(row));
	 });
	});
	 