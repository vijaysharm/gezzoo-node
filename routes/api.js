var login = require('./login');
var impl = require('./data/impl');
var engine = require('./data/engine');
var util = require('./util')
var _ = require('underscore');

/*** Middleware CHECKS ***/
function fetchAction( req, res, next ) {
	req.action = util.extract( req, 'action' );
	req.value = util.extract( req, 'value' );
	next();
};

function fetchOpponent( req, res, next ) {
	var opponent = util.extract( req, 'opponent');
	impl.getUser(opponent, function(person) {
		if ( person ) {
			req.opponent = person;
		}
		next();
	});
};

function fetchGame( req, res, next ) {
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
function fetchBoard( req, res, next ) {
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
function fetchCharacter( req, res, next ) {
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

exports.install = function( app ) {
	// app.get( '/api/games', authenticate, getGames );
	// app.get( '/api/games/:id', authenticate, getGame );
	app.post('/api/games',
			 authenticate,
			 fetchOpponent,
			 impl.startNewGame);
	app.post('/api/games/:id/character',
			 authenticate,
			 fetchGame,
			 fetchCharacter,
			 engine.verifySetCharacter,
			 impl.setCharacter);
	app.post('/api/games/:id/action',
			 authenticate,
			 fetchGame,
			 fetchAction,
			 fetchBoard,
			 engine.verifyAskQuestion,
			 impl.postAction);
	app.post('/api/games/:id/board',
			 authenticate,
			 fetchGame,
			 fetchBoard,
			 engine.verifyUpdateBoard,
			 impl.updateBoard);	
	app.post('/api/games/:id/guess',
			 authenticate,
			 fetchGame,
			 fetchCharacter,
			 engine.verifyGuess,
			 impl.guess);		
};