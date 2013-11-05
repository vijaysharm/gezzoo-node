var login = require('./login');
var impl = require('./data/impl');
var util = require('./util')

/*** Middleware CHECKS ***/
var checkOpponent = function( req, res, next ) {
	var opponent = util.extract( req, 'opponent');
	impl.getUser(opponent, function(person) {
		if ( person ) {
			req.opponent = person;
		}
		next();
	});
};

var checkGame = function( req, res, next ) {
	var gameid = util.extract(req, 'id');
	impl.getGame(gameid, function(game) {
		if ( game ) {
			req.game = game;
		}
		next();
	});
};

/**
 * Assumes getGame has already been called and is
 * set in the req.game field.
 */
var checkCharacter = function( req, res, next ) {
	var game = req.game;
	var boardid = game.board;
	var characterid = util.extract(req, 'character');
	console.log('received character id: ' + characterid);
	impl.getBoardByCharacter(boardid, characterid, function(board) {
		if ( board ) {
			impl.getCharacter( characterid, function( character ) {
				if ( character ) {
					req.character = character;
				}
				next();
			});
		} else {
			// TODO: Should probably send back an error saying
			//       this character is not part of this board.
			next();	
		}
	});
};

var authenticate = function( req, res, next ) {
	login.authenticate( req, res, next );
};

/*** API Handlers ***/
var getGames = function( req, res ) {
	// var username = req.user.username;
	// var userGames = impl.findGames( username );
	// res.json( JSON.stringify(userGames) );
	res.json( 404 );
};

var getGame = function( req, res ) {
	// var username = req.user.username;
	// var gameId = parseInt( req.params.id );
	// var userGames = impl.findGame( username, gameId );
	// res.json( JSON.stringify(userGames) );
	res.json( 404 );
};

var createGame = function( req, res ) {
	var user = req.user;
	var opponent = req.opponent;
	impl.startNewGame( user, opponent, res );
};

var setCharacter = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;
	impl.setCharacter( user, game, character, res );
};

var postAction = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var actiontype = util.extract( req, 'action' );
	var actionvalue = util.extract( req, 'value' );
	impl.postAction( user, game, actiontype, actionvalue, res );
}

exports.install = function( app ) {
	// app.get( '/api/games', authenticate, getGames );
	// app.get( '/api/games/:id', authenticate, getGame );
	app.post('/api/games',
			 authenticate,
			 checkOpponent,
			 createGame);
	app.post('/api/games/:id/character',
			 authenticate,
			 checkGame,
			 checkCharacter,
			 setCharacter);
	app.post('/api/games/:id/action',
			 authenticate,
			 checkGame,
			 postAction);	
};