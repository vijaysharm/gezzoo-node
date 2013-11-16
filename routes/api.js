var login = require('./login');
var impl = require('./data/impl');
var engine = require('./data/engine');
var util = require('./util');
var connection = require('./database');
var _ = require('underscore');

/*** Middleware CHECKS ***/
function fetchAction( req, res, next ) {
	req.action = util.extract( req, 'action' );
	req.value = util.extract( req, 'value' );
	next();
};

function fetchOpponent( req, res, next ) {
	var opponent = util.extract( req, 'opponent');
	var db = req.db;
	impl.getUser(db, opponent, function(person) {
		if ( person ) {
			req.opponent = person;
		}
		next();
	});
};

function fetchGame( req, res, next ) {
	var gameid = util.toObjectId(util.extract(req, 'id'));
	var user = req.user;
	var db = req.db;
	impl.getGame(db, gameid, user, function(game) {
		if ( game ) {
			req.game = game;
			next();
		} else {
			db.close();
			res.json(401, 'No game with ID ' + gameid);
		}
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
	var db = req.db;
	var player_board = util.extract(req, 'player_board');
	if ( player_board ) {
		impl.getBoard(db, game.board, function(board) {
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
	} else {
		next();
	}
};

/**
 * Assumes getGame has already been called and is
 * set in the req.game field.
 */
function fetchCharacter( req, res, next ) {
	var game = req.game;
	var boardid = game.board;
	var db = req.db;
	var characterid = util.extract(req, 'character');
	impl.getBoardByCharacter(db, boardid, characterid, function(board) {
		if ( board ) {
			impl.getCharacter(db, characterid, function( character ) {
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

function getDb( req, res, next ) {
	connection.getInstance(function(db) {
		req.db = db;
		next();
	});
};

function authenticate( req, res, next ) {
	login.authenticate( req, res, next );
};

exports.install = function( app ) {
	app.get('/api/games',
			getDb,
			authenticate,
			impl.getGames);
	app.get('/api/games/:id',
			getDb,
			authenticate,
			fetchGame,
			impl.getGameById);
	app.post('/api/games',
			 getDb,
			 authenticate,
			 fetchOpponent,
			 impl.startNewGame);
	app.post('/api/games/:id/character',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchCharacter,
			 engine.verifySetCharacter,
			 impl.setCharacter);
	app.post('/api/games/:id/action',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchAction,
			 fetchBoard,
			 fetchCharacter,
			 engine.verifyAskQuestion,
			 impl.postAction);
	app.post('/api/games/:id/board',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchBoard,
			 engine.verifyUpdateBoard,
			 impl.updateBoard);	
	app.post('/api/games/:id/guess',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchCharacter,
			 engine.verifyGuess,
			 impl.guess);		
};