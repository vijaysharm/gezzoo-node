var login = require('./login');
var games = require('./data/games');

var getGames = function( req, res ) {
	var username = req.session.user.username;
	var userGames = games.findGames( username );
	res.json( JSON.stringify(userGames) );
};

var getGame = function( req, res ) {
	var username = req.session.user.username;
	var gameId = parseInt( req.params.id );
	var userGames = games.findGame( username, gameId );
	res.json( JSON.stringify(userGames) );
};

exports.install = function( app ) {
	app.get( '/api/games', login.authenticate, getGames );
	app.get( '/api/games/:id', login.authenticate, getGame );
};