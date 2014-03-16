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
	findOneById(db, boardid, 'boards', function(board) {
		if ( board ) {
			var query = {
				'_id': {$in:board.characters}
			};
			db.characters().find(query).toArray(function(err, board_characters) {
				if ( err ) throw err;
				board.characters = board_characters;
				callback( board );
			})
		} else {
			callback( board );
		}
	});
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
 * TODO: Should probably take the game ID as a 
 *  	 query parameter
 * 
 * @param user assumes this is the user
 * 		  object stored in the game object
 *
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

function formatGamesResponse( user, games, boards, users, actions ) {
	var gs = [];
	_.each(games, function(game) {

		// process game to be formatted properly
		var board = _.find(boards, function(board) {
			return board._id.equals(game.board);
		});
		var gameopponent = gameutil.extractOpponent(user, game);
		var gameuser = gameutil.extractUser(user, game);
		var gameactions = _.filter(actions, function(action) {
			return game._id.equals(action.gameid);
		});

		var me = _.extend({}, user, _.pick(gameuser, 'board', 'character'));
		var myactions = _.filter(gameactions, function(action){
			return me._id.equals(action.by);
		});
		_.extend(me, {actions:myactions});

		var opponent = _.find(users, function(user) {
			return user._id.equals(gameopponent.id);
		});
		var opponent_actions = _.filter(gameactions, function(action){
			return opponent._id.equals(action.by);
		});
		_.extend(opponent, {actions:opponent_actions});

		var state = game.turn.equals(me._id) ? getState(me, opponent) : 'read-only';
		state = game.ended ? 'read-only' : state;

		gs.push({
			_id: game._id,
			me: me,
			opponent: opponent,
			board: board,
			turn: game.turn,
			ended: game.ended,
			modified: game.modified,
			state: state,
			winner: game.winner
		});
	});

	return gs;
}

/**
 * TODO: Need to return the characters from the board. Currently doing
 *		 empty query, and not adding to response.
 */
exports.getGames = function( req, res ) {
	var user = req.user;
	var db = req.db;

	var gamesdb = db.games();
	var query = {
		'players.id': {$in:[user._id]},
		// 'ended': false
	};
	
	// TODO: Here begins the crazy data processing.
	//		 I get the feeling the code below will not 
	//		 scale.
	gamesdb.find(query).toArray(function(err, games) {
		if ( err ) throw err;
		var pre = _.chain(games).pluck('players').flatten();
		var users = pre.uniq(function(obj){ return obj.id.toString(); }).pluck('id').value();
		var actions = pre.pluck('actions').flatten().value();
		var boards = _.chain(games).pluck('board').uniq(function(obj){ return obj.toString(); }).value();

		db.boards().find({ _id: {$in:boards}}).toArray(function(err, boards) {
			if ( err ) throw err;
			db.characters().find({}).toArray(function(err, board_characters) {
				if ( err ) throw err;
				db.actions().find({ _id: {$in:actions}}).toArray(function(err, actions) {
					if ( err ) throw err;
					db.users().find({ _id: {$in:users}}).toArray(function(err, users) {
						if ( err ) throw err;
						res.json(formatGamesResponse(user, games, boards, users, actions))
					});
				});
			});
		});
	});
};

function getMostRecentAction( actions ) {
	if ( actions && actions.length > 0 ) {
		var sorted_actions = _.sortBy( actions, function(action){ return action.modified });
		return sorted_actions[sorted_actions.length-1];
	} else {
		return null;
	}
};

// TODO: Maybe we can check the gameuser's actions
//       and if there's something that doesn't make
// 		 sense, we can set something to have the turn
//	     updated to the opponent
function getState( user, opponent ) {
	var opponent_action = getMostRecentAction(opponent.actions);

	if ( user.character ) {
		if ( opponent_action ) {
			if ( opponent_action.action === 'guess' ) {
				return 'user-action';
			} else if ( opponent_action.action === 'question' ) {
				if ( opponent_action.reply ) {
					return 'user-action';
				} else {
					return 'user-reply';
				}
			} else {
				return 'error: unknown state ' + opponent_action.action;
			}
		} else {
			return 'user-action';
		}
	} else {
		return 'user-select-character';
	}
};

/**
 * TODO: Get fancy and modify any of the guess 
 * 		 actions and add whether the guess was 
 *  	 right or wrong
 */
exports.getGameById = function( req, res ) {
	var game = req.game;
	var user = req.user;
	var gameuser = gameutil.extractUser(user, game);

	delete req.board._id;

	var me = _.extend({}, user, _.pick(gameuser, 'board', 'character'));
	_.extend(me, {actions: req.user_actions});

	var opponent = _.extend({}, req.opponent, {
		actions: req.opponent_actions
	});

	var state = game.turn.equals(me._id) ? getState(me, opponent) : 'read-only';
	state = game.ended ? 'read-only' : state;
	
	var result = {
		_id : game._id,
		me: me,
		opponent: opponent,
		board: req.board,
		ended: game.ended,
		turn: game.turn,
		state: state,
		modified: game.modified,
		winner: game.winner
	};

	res.json(result);
};

/**
 * TODO: get a list of all the ongoing games, and use them as
 * 		 as a filter for users to search for. i.e. do not include
 * 		 users that this user already has ongoing games with.
 * 
 * TODO: Improve this query so that the selected users
 * 		 Are newer and the more active users. This way
 * 		 this user has a better chance to have people
 * 		 to play with
 *
 * TODO: Add a BAN list, so that games that are not replayed with
 * 		 a certain opponent are not selected again
 */
function createNewGame( db, user, res ) {
	// 1) we find all the games that the current user is playing
	var gamesdb = db.games();
	var query = {'players.id':{$in:[ user._id ]}};
	gamesdb.find(query).toArray(function( err, matches ) {
		if ( err ) throw err;

		// 2) If the user has ongoing games, get the list of all the
		//	  players they are currently playing against, else just
		// 	  include the user himself.
		var users;
		if ( matches && matches.length > 0 ) {
			users = _.chain(matches)
						.pluck('players')
						.flatten()
						.uniq(function(obj){ return obj.id.toString(); })
						.pluck('id')
						.value();
		} else {
			users = [user._id];
		}

		// 3) Find users that the current user does not have current
		//	  games in progress with.
		var usersdb = db.users();
		var user_row_limit = 20;
		var query = {_id:{$nin:users}};
		usersdb.find(query).limit(user_row_limit).toArray(function( err, opponents ) {
			if ( err ) throw err;
			if ( opponents.length > 0 ) {
				// Choose a random opponent from the list of returned 
				// users. This could be Improved.
				var index = util.random(opponents.length-1);
				createNewGameWithUser( db, user, opponents[index], res );				
			} else {
				res.json(401, {error: 'aww, there isnt anyone else you can play with :('});
			}
		});
	});
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
	deleteExistingGames( db, user, opponent, res, function() {
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
						ended: insertedgame.ended,
						modified: insertedgame.modified,
						state: 'user-select-character'
					});
				});
			});
		});
	});
};

function deleteExistingGames( db, user, opponent, res, callback ) {
	var query = {
		'players.id': {$all:[user._id, opponent._id]},
		ended: true
	};

	db.games().find(query).toArray(function(err, games) {
		var ids = _.pluck(games, '_id');
		if ( ids.length > 0 ) {
			db.games().remove({_id: {$in:ids}});
			db.actions().remove({gameid: {$in:ids}});
		}

		callback();
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
		$set: { 
			'players.$.character': character._id,
			turn: nextturn.id,
			modified: new Date()
		}
	};

	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];
	gamesdb.findAndModify(query, sort, update, options, function(err, insertedgame) {
		if ( err ) throw err;
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
		by: user._id,
		modified: new Date()
	};

	db.actions().insert(guessitem, function(err, guessitems) {
		var guessitem = guessitems[0];

		var fields = {
			turn: opponent.id,
			ended: userguess,
			modified: new Date(),
		};
		if ( req.player_board ) {
			_.extend( fields, {
				'players.$.board': player_board
			});
		}
		if ( userguess ) {
			fields.winner = {
				by: user._id,
				actionid: guessitem._id
			}
		}

		var update = {
			$push: { 'players.$.actions': guessitem._id },
			$set: fields
		};

		var query = {
			_id: game._id,
			'players.id': user._id,
		};

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
		by: user._id,
		modified: new Date()
	};

	db.actions().insert(questionitem, function(err, questionitems) {
		var questionitem = questionitems[0];
		var fields = { 
			turn: nextturn.id,
			modified: new Date()
		};
		if ( req.player_board ) {
			_.extend( fields, {
				'players.$.board': player_board
			});
		}

		var update = {
			$push: { 'players.$.actions': questionitem._id },
			$set: fields
		};

		var query = {
			_id: game._id,
			'players.id': user._id,
		};
		pushAction( db, query, update, function(result) {
			res.json({
				gameid: game._id
			});
		});
	});
};

/**
 * TODO: The game's 'modified' property is not updated
 */
exports.postReply = function( req, res ) {
	var reply = req.reply;
	var questionid = req.questionid;
	var db = req.db;

	var query = {
		_id: questionid
	};
	var update = {
		$set: {
			reply: { value: reply, date: new Date() },
			modified: new Date()
		},
	};
	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];

	db.actions().findAndModify(query, sort, update, options, function(err, action) {
		if ( err ) throw err;
		res.json(200, action);
	});
};
