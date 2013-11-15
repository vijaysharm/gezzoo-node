var connection = require('../database');
var util = require('../util');
var _ = require('underscore');

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

function log( data ) {
	if ( typeof( data ) === 'string' )
		console.log(data)
	else
		console.log(JSON.stringify( data ));
};

function extractOpponent(user, game) {
	return _.find(game.players, function(player) {
		return ! user._id.equals(player);
	});
};

/**
 * @param id can be a string ID, or object ID
 */
function findOneById( db, id, collection, callback ) {
	if ( id ) {
		var obj = typeof(id) === 'string' ? 
						  util.toObjectId(id) : id;
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

/**
 * @param user is the user ID as a string
 */
exports.getUser = function( db, userid, callback ) {
	findOneById(db, userid, 'users', callback);
};

exports.getGame = function( db, gameid, callback ) {
	findOneById(db, gameid, 'games', callback);
};

exports.getCharacter = function( db, characterid, callback ) {
	findOneById(db, characterid, 'characters', callback);
};

exports.getBoard = function( boardid, callback ) {
	findOneById(db, boardid, 'boards', callback );
};

/**
 * @param boardid is an object id of the board
 * @param character is a string id of the character
 */
exports.getBoardByCharacter = function( db, boardid, characterid, callback ) {
	characterid = util.toObjectId(characterid);
	var query = {
		_id: boardid,
		characters: {$all:[characterid]}
	};

	findOne( query, 'boards', callback );
};

exports.getGames = function( req, res ) {
	var user = req.user;
	var db = req.db;

	var gamesdb = db.games();
	var query = {
		players: {$in:[user._id]},
		ended: false
	};

	var options = {
		players: 1,
		turn: 1,
		_id: 1
	};

	gamesdb.find(query, options).toArray(function(err, games) {
		db.close();
		res.json({error: 'getGames not implemented'});
	});
};

exports.getGameById = function( req, res ) {
	var game = req.game;
	var user = req.user;
	var db = req.db;

	db.close();
	res.json({error: 'getGameById not implemented'});
};

var createNewGame = function( db, user, res ) {
	// 1. search for a user to play against
	// 2. select the board from which they will play
	// 3. start the game, and return enough info to the client

	// TODO: get a list of all the ongoing games, and use them as
	//       as a filter for users to search for. i.e. do not include
	//       users that this user already has ongoing games with.

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
		var query = {_id:{$nin:[ util.toObjectId( user.id ) ]}};
		usersdb.find(query).limit(user_row_limit).toArray(function( err, opponents ) {
			// Choose a random opponent from the list of returned 
			// users. This could be Improved.
			var index = util.random(opponents.length-1);
			createNewGameWithUser( user, opponents[index], db, res );
		});
	// })
};

/**
 * @param user the user object from the DB with all properties
 * @param opponent the user object from the DB with all properties
 */
var createNewGameWithUser = function( user, opponent, db, res ) {
	var boardsdb = db.boards();
	var gamesdb = db.games();
	var characters = db.characters();
	var boards_row_count = 1;
	var query = {}
	boardsdb.find(query).limit(boards_row_count).toArray(function(err, boards) {
		if ( err ) throw err;

		// TODO: I'm just getting the first board from the DB. This can 
		//       be improved so that either we choose a random board, or
		//       we let the user choose a board. (We can even let them 
		//       decide if they want a smaller board for a shorter game
		//       or a larger board for a longer game)
		var board = boards[0];
		var player_characters = transform(board.characters, {up: true});
		
		var game = {
			players: [user._id, opponent._id],
			board: board._id,
			selected_characters: [],
			turn: user._id,
			ended: false,
			actions: [
				{ player: user._id, list:[] },
				{ player: opponent._id, list:[] },
			],
			player_board : [
				{ player: user._id, board: player_characters },
				{ player: opponent._id, board: player_characters },
			]
		};

		gamesdb.insert(game, function(err, results) {
			var insertedgame = results[0];
			var query = {_id:{ $in: board.characters }};
			var options = {name:1, img:1};
			characters.find(query, options).toArray(function(err, fullcharacters) {
				db.close();
				board.characters = fullcharacters;
				
				// We only need to return back certain fields
				res.json({
					players: insertedgame.players,
					turn: insertedgame.turn,
					_id: insertedgame._id,
					board: board,
					player_board: player_characters
				});
			});
		});
	});
};

/**
 * @param user the user object from the users db
 * @param opponent the user object form the users db
 */
exports.startNewGame = function( req, res ) {
	var user = req.user;
	var opponent = req.opponent;
	var db = req.db;

	if ( opponent ) {
		createNewGameWithUser( user, person, db, res );
	} else {
		createNewGame( db, user, res );
	}
};

/**
 * @param user is the user from the userdb
 * @param game is the game object from the db
 * @param character is the character object from the db
 */
exports.setCharacter = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;
	var db = req.db;

	// TODO: If its the opponent that's setting the
	//       character, you don't want to change the turn
	//       since they have to also ask a question
	var nextturn = extractOpponent(user, game);
	var gamesdb = db.games();
	var query = {
		_id: game._id
	};
	var update = {
		$push: {
			selected_characters:{ 
				player:user._id,
				character:character._id 
			}
		},
		$set: {
			turn: nextturn
		}
	};
	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];
	gamesdb.findAndModify(query, sort, update, options, function(err, insertedgame) {
		db.close();			
		res.json(200);
	});
};

exports.updateBoard = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var board = req.board;
	var player_board = req.player_board;
	var db = req.db;
	var nextturn = extractOpponent(user, game);

	var gamesdb = db.games();
	var playerid = user._id;

	var query = {
		_id: game._id,
		'player_board.player': playerid
	};
	var update = {
		$set: { 'player_board.$.board': player_board },
		$set: { turn: nextturn }
	};
	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];

	gamesdb.findAndModify(query, sort, update, options, function(err, game) {
		if ( err ) throw err;

		var result = findGamePropertyByUser(game.player_board, playerid);
		db.close();

		// TODO: I should probably also return the game id
		res.json(result);
	});	
};

function pushAction( db, query, update, callback ) {
	var gamesdb = db.games();

	var options = { upsert:false, 'new':true };
	var sort = [['_id','1']];
	gamesdb.findAndModify(query, sort, update, options, function(err, game) {
		if ( err ) throw err;

		db.close();
		callback(game);
	});
}

/**
 * TODO: If the action is a guess, we should set the game to ended
 *       and we should return that the user guessed right in the 
 *       response
 *
 * combinations:
 *		{ action: question, value: hi.. }
 * 		{ action: reply, value: hi.. }
 * 		{ action: guess, value: ?, character: objectid }
 */
exports.postAction = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var action = req.action;
	var value = req.value;
	var player_board = req.player_board;
	var character = req.character;
	var db = req.db;

	var opponent = extractOpponent(user, game);
	var nextturn = extractOpponent(user, game);
	var playerid = action === 'reply' ? opponent : user._id;
	var result = findGamePropertyByUser(game.selected_characters, opponent);
	var userguess = false;

	if ( action === 'guess' && result && character ) {
		userguess = result.character.equals(character._id);
		/** the character should be */
		value = userguess;
	}

	var query = {
		_id: game._id,
		'actions.player': playerid
	};

	var actionitem = {
		action:action,
		value:value,
		by: by
	};
	
	var update = {
		$push: { 'actions.$.list': actionitem },
		$set: { turn: nextturn }
	};

	if ( player_board ) {
		_.extend( query, {'player_board.player': playerid} );
		_.extend( update, {$set: { 'player_board.$.board': player_board }} );
	}

	if ( action === 'guess' ) {
		_.extend( update, {$set:{ ended: userguess }});
	}

	pushAction( db, query, update, function(result) {
		// TODO: I need to return the board if it was passed in
		_.extend(actionitem, {gameid: game._id});
		res.json(actionitem);
	});
};

exports.guess = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;
	var db = req.db;

	var opponent = extractOpponent(user, game);
	var result = findGamePropertyByUser(game.selected_characters, opponent);
	var userguess = result.character.equals(character._id);

	var query = {
		_id: game._id,
		'actions.player': user._id
	};
	var actionitem = {
		action: 'guess',
		value: userguess,
		by: user._id
	};
	var update = {
		$push: { 'actions.$.list': actionitem },
		$set: { turn: nextturn },
		$set: { ended: userguess },
	};

	pushAction( db, user._id, game, 'guess', userguess, user._id, nextturn, function(result, db) {
		db.close();
		res.json({
			gameid: game._id,
			result: userguess
		});
	});
};
