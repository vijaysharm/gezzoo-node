var express = require('express');
var http = require('http');
var path = require('path');
var gezzoo = require('./routes');
var migrate = require('./routes/migratedb');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('D49F23B0-2328-11E3-8224-0800200C9A66'));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
	migrate = require('./routes/migrate.fake');
}

migrate.execute(function() {
	gezzoo.init(app);
	http.createServer(app).listen(app.get('port'));
});
