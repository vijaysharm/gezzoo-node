var login = require('./login');
var impl = require('./data/impl');
var util = require('./util')
var _ = require('underscore');

/*** Middleware CHECKS ***/
function checkAction( req, res, next ) {
	req.action = util.extract( req, 'action' );
	req.value = util.extract( req, 'value' );
	next();
};

function checkOpponent( req, res, next ) {
	var opponent = util.extract( req, 'opponent');
	impl.getUser(opponent, function(person) {
		if ( person ) {
			req.opponent = person;
		}
		next();
	});
};

function checkGame( req, res, next ) {
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
 * 
 * What I don't particularly like is the fact that
 * I'm building the what a character in the player 
 * board looks like. This could be improved
 */
function checkBoard( req, res, next ) {
	var game = req.game;
	var player_board = util.extract(req, 'player_board');
	impl.getBoard(game.board, function(board) {
		var fullboard = [];
		_.each(player_board, function(character) {
			var id = util.toObjectId(character._id);
			var exists = _.find(board.characters, function(c) {
				return id.equals(c);
			});

			if ( exists ) {
				fullboard.push({
					_id: id,
					up: character.up
				})
			}
		});

		req.player_board = fullboard;
		req.board = board;

		next();
	});
};

/**
 * Assumes getGame has already been called and is
 * set in the req.game field.
 */
function checkCharacter( req, res, next ) {
	var game = req.game;
	var boardid = game.board;
	var characterid = util.extract(req, 'character');
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

function authenticate( req, res, next ) {
	login.authenticate( req, res, next );
};

/*** API Handlers ***/
function getGames( req, res ) {
	// var username = req.user.username;
	// var userGames = impl.findGames( username );
	// res.json( JSON.stringify(userGames) );
	res.json( 404 );
};

function getGame( req, res ) {
	// var username = req.user.username;
	// var gameId = parseInt( req.params.id );
	// var userGames = impl.findGame( username, gameId );
	// res.json( JSON.stringify(userGames) );
	res.json( 404 );
};

function createGame( req, res ) {
	var user = req.user;
	var opponent = req.opponent;
	impl.startNewGame( user, opponent, res );
};

function setCharacter( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;
	impl.setCharacter( user, game, character, res );
};

function postAction( req, res ) {
	var user = req.user;
	var game = req.game;
	var actiontype = req.action;
	var actionvalue = req.value;
	impl.postAction( user, game, actiontype, actionvalue, res );
}

function updateBoard( req, res ) {
	var user = req.user;
	var game = req.game;
	var board = req.board;
	var player_board = req.player_board;
	impl.updateBoard( user, game, board, player_board, res );
};

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
			 checkAction,
			 postAction);
	app.post('/api/games/:id/board',
			 authenticate,
			 checkGame,
			 checkBoard,
			 updateBoard);	
};