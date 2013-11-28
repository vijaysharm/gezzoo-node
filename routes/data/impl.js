var connection = require('../database');
var util = require('../util');
var isString = util.isString;
var log = util.log;
var toObjectId = util.toObjectId;
var gameutil = require('../game.util');
var Game = gameutil.Game;
var _ = require('underscore');

function objId( p ) {
	return isString( p ) ? toObjectId( p ) : p;
};

function findGamePropertyByUser( list, playerid ) {
	return _.find(list, function(item) {
		return playerid.equals(item.player);
	});
};

function transform(list,value) {
	var a = [];
	_.each(list, function(l) {
		var r = _.extend({ _id: l }, value);
		a.push(r);
	});
	return a;
};

/**
 * @param id can be a string ID, or object ID
 */
function findOneById( db, id, collection, callback ) {
	if ( id ) {
		var obj = objId( id );
		var query = {_id:obj};
		findOne( db, query, collection, callback );
	} else {
		callback( null );
	}
};

function findOne( db, query, collection, callback ) {
	var collectiondb = db[collection]();
	collectiondb.findOne(query, function(err, obj) {
		if ( err ) throw err;
		callback(obj);
	});
};

exports.getUser = function( db, userid, callback ) {
	findOneById(db, userid, 'users', callback);
};

exports.getGame = function( db, gameid, user, callback ) {
	gameid = objId(gameid);
	var query = {
		'_id':gameid,
		'players.id': {$in:[user._id]}
	};

	findOne(db, query, 'games', callback);	
};

exports.getCharacter = function( db, characterid, callback ) {
	findOneById(db, characterid, 'characters', callback);
};

exports.getBoard = function( db, boardid, callback ) {
	findOneById(db, boardid, 'boards', callback );
};

exports.getBoardByCharacter = function( db, boardid, characterid, callback ) {
	characterid = objId(characterid);
	boardid = objId(boardid);
	var query = {
		_id: boardid,
		characters: {$all:[characterid]}
	};

	findOne(db, query, 'boards', callback);
};

exports.getActionById = function( db, actionid, callback ) {
	findOneById(db, actionid, 'actions', callback );
};

/**
 * @param user assumes this is the user
 * 		  object stored in the game object
 */
exports.getActions = function( db, user, callback ) {
	var actionsdb = db.actions();
	var query = {
		_id: {$in:user.actions},
		by: user.id
	};
	actionsdb.find(query).toArray(function(err, actions) {
		if (err) throw err;
 		callback(actions);
	});
};

exports.getGames = function( req, res ) {
	// var user = req.user;
	// var db = req.db;

	// var gamesdb = db.games();
	// var query = {
	// 	'players.id': {$in:[user._id]},
	// 	'ended': false
	// };

	// var options = {
	// 	players: 1,
	// 	turn: 1,
	// 	_id: 1
	// };

	// gamesdb.find(query, options).toArray(function(err, games) {
		res.json({error: 'getGames not implemented'});
	// });
};

exports.getGameById = function( req, res ) {
	var game = req.game;
	var user = req.user;
	var db = req.db;
	res.json(game);
};

/**
 * TODO: get a list of all the ongoing games, and use them as
 * 		 as a filter for users to search for. i.e. do not include
 * 		 users that this user already has ongoing games with.
 */
function createNewGame( db, user, res ) {
	// 1. search for a user to play against
	// 2. select the board from which they will play
	// 3. start the game, and return enough info to the client

	// var gamesdb = db.games();
	// var query = {players:{$all:[util.toObjectId( user.id )]}};
	// log( query );
	// gamesdb.find(query).toArray(function( err, matches ) {
	// 	if ( err ) throw err;

		// TODO: Improve this query so that the selected users
		//       Are newer and the more active users. This way
		//       this user has a better chance to have people
		//       to play with
		var usersdb = db.users();
		var user_row_limit = 20;
		var query = {_id:{$nin:[ user._id ]}};
		usersdb.find(query).limit(user_row_limit).toArray(function( err, opponents ) {
			// Choose a random opponent from the list of returned 
			// users. This could be Improved.
			var index = util.random(opponents.length-1);
			createNewGameWithUser( db, user, opponents[index], res );
		});
	// })
};

/**
 * TODO: We should check if there is a game already in progress
 * 		 which isn't ended, and return that game if it exists
 * 		 otherwise, create a new game
 *
 * TODO: I'm just getting the first board from the DB. This can 
 * 		 be improved so that either we choose a random board, or
 * 		 we let the user choose a board. (We can even let them 
 * 		 decide if they want a smaller board for a shorter game
 * 		 or a larger board for a longer game)
 *
 * @param user the user object from the DB with all properties
 * @param opponent the user object from the DB with all properties
 */
function createNewGameWithUser( db, user, opponent, res ) {
	var boardsdb = db.boards();
	var gamesdb = db.games();
	var characters = db.characters();
	var boards_row_count = 1;
	var query = {}
	boardsdb.find(query).limit(boards_row_count).toArray(function(err, boards) {
		if ( err ) throw err;

		var board = boards[0];
		var player_characters = transform(board.characters, {up: true});
		
		var game = new Game()
			.board(board._id)
			.turn(user._id)
			.ended(false)
			.addPlayer({
				id: user._id,
				board: player_characters
			})
			.addPlayer({
				id: opponent._id,
				board: player_characters
			})
			.toDbObject();

		gamesdb.insert(game, function(err, results) {
			var insertedgame = results[0];
			var query = {_id:{ $in: board.characters }};
			var options = {name:1, img:1};
			characters.find(query, options).toArray(function(err, fullcharacters) {
				board.characters = fullcharacters;

				// We only need to return back certain fields
				res.json({
					players: insertedgame.players,
					opponent: opponent,
					turn: insertedgame.turn,
					_id: insertedgame._id,
					board: board,
					ended: insertedgame.ended
				});
			});
		});
	});
};

exports.startNewGame = function( req, res ) {
	var user = req.user;
	var opponent = req.opponent;
	var db = req.db;

	if ( opponent ) {
		createNewGameWithUser( db, user, opponent, res );
	} else {
		createNewGame( db, user, res );
	}
};

/**
 * TODO: If its the opponent that's setting the
 * 		 character, you don't want to change the
 * 		 turn since they have to also ask a question
 */
exports.setCharacter = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;
	var db = req.db;

	var nextturn = gameutil.extractOpponent(user, game);
	var gamesdb = db.games();
	var query = {
		_id: game._id,
		'players.id': user._id
	};
	var update = {
		$set: { 'players.$.character': character._id },
		$set: { turn: nextturn }
	};
	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];
	gamesdb.findAndModify(query, sort, update, options, function(err, insertedgame) {
		res.json(200);
	});
};

function pushAction( db, query, update, callback ) {
	var gamesdb = db.games();

	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];
	gamesdb.findAndModify(query, sort, update, options, function(err, game) {
		if ( err ) throw err;
		callback(game);
	});
}

/**
 * TODO: We're assuming that the player_board is in the 'right
 *  	 form' for saving to the database.
 */
exports.guess = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;
	var player_board = req.player_board;
	var db = req.db;

	var opponent = gameutil.extractOpponent(user, game);
	var userguess = opponent.character.equals(character._id);

	// Here, im storing who the user guessed. 
	// The client can decipher whether to show if its right or not
	// We will however, save that the game is over if the user guessed correctly.
	// And we will return whether the guess was right or wrong
	var guessitem = {
		gameid: game._id,
		action: 'guess',
		value: character._id,
		by: user._id
	};

	db.actions().insert(guessitem, function(err, guessitem) {
		var query = {
			_id: game._id,
			'players.id': user._id,
		};

		var update = {
			$push: { 'players.$.actions': guessitem._id },
			$set: { turn: opponent },
			$set: { ended: userguess },
		};

		if ( req.player_board ) {
			_.extend( update, {
				$set: { 'players.$.board': player_board }
			});
		}

		pushAction( db, query, update, function(result) {
			res.json({
				gameid: game._id,
				guess: userguess
			});
		});
	});
};

exports.askQuestion = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var question = req.question;
	var player_board = req.player_board;
	var db = req.db;
	var nextturn = gameutil.extractOpponent(user, game);

	var questionitem = {
		gameid: game._id,
		action: 'question',
		value: question,
		by: user._id
	};

	db.actions().insert(questionitem, function(err, questionitem) {
		var query = {
			_id: game._id,
			'players.id': user._id,
		};
		
		var update = {
			$push: { 'players.$.actions': questionitem._id },
			$set: { turn: nextturn.id }
		};

		if ( req.player_board ) {
			_.extend( update, {
				$set: { 'players.$.board': player_board }
			});
		}

		pushAction( db, query, update, function(result) {
			res.json({
				gameid: game._id
			});
		});
	});
};

exports.postReply = function( req, res ) {
	var reply = req.reply;
	var questionid = req.questionid;
	var db = req.db;

	var query = {
		_id: questionid
	};
	var update = {
		$set: {reply: { value: reply }}
	};
	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];

	db.actions().findAndModify(query, sort, update, options, function(err, action) {
		if ( err ) throw err;
		res.json(200, action);
	});
};
