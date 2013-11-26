var login = require('./login');
var impl = require('./data/impl');
var engine = require('./data/engine');
var util = require('./util');
var gameutil = require('./game.util');
var connection = require('./database');
var _ = require('underscore');

/*** Middleware CHECKS ***/
function fetchQuestion( req, res, next ) {
	req.question = util.extract( req, 'question' );
	next();
};

function fetchReply( req, res, next ) {
	req.questionid = util.extract( req, 'question' );
	req.reply = util.extract( req, 'reply' );
	next();
};


function fetchOpponentActions( req, res, next ) {
	var user = req.user;
	var db = req.db;
	var opponent = gameutil.extractOpponent(user, req.game);
	impl.getActions(db, opponent, function(actions) {
		req.opponent_actions = actions;
		next();
	});
};

function fetchOpponent( req, res, next ) {
	var user = req.user;
	var db = req.db;
	var opponent = util.extract( req, 'opponent' );
	if ( req.game )
		opponent = gameutil.extractOpponent(user, req.game).id || opponent;

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
			res.json(401, 'No game with ID ' + gameid);
		}
	});
};

/**
 * Assumes getGame has already been called and is
 * set in the req.game field.
 * 
 * TODO: What I don't particularly like is the fact that
 * 		 I'm building the what a character in the player 
 * 		 board looks like. This could be improved
 */
function fetchBoard( req, res, next ) {
	var game = req.game;
	var db = req.db;
	var player_board = util.extract(req, 'player_board');
	if ( player_board ) {
		req.player_board = player_board;
		impl.getBoard(db, game.board, function(board) {
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
			next();
		}
	});
};

function getDb( req, res, next ) {
	connection.getInstance(function(db) {
		req.db = db;
		res.on('finish', function() {
			req.db.close();
		});
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
			 engine.verifyNewGame,
			 impl.startNewGame);
	app.post('/api/games/:id/character',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchCharacter,
			 engine.verifySetCharacter,
			 impl.setCharacter);
	app.post('/api/games/:id/question',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchBoard,
			 fetchOpponent,
			 fetchQuestion,
			 engine.verifyAskQuestion,
			 impl.askQuestion);
	app.post('/api/games/:id/reply',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchBoard,
			 fetchOpponent,
			 fetchOpponentActions,
			 fetchReply,
			 engine.verifyPostReply,
			 impl.postReply);
	app.post('/api/games/:id/guess',
			 getDb,
			 authenticate,
			 fetchGame,
			 fetchOpponent,
			 fetchCharacter,
			 fetchBoard,
			 engine.verifyGuess,
			 impl.guess);
};