var express = require('express');
var http = require('http');
var path = require('path');
var gezzoo = require('./routes');
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
}

gezzoo.init(app);

http.createServer(app).listen(app.get('port'));

// app.post( '/update/:username/:id', function( req, res ) {
// 	// game1.messages = req.body.
// 	JSON.stringify( req.body.messages );
// 	res.redirect( '/user/' + req.params.username );
// });
