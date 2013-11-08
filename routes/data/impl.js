var connection = require('../database');
var util = require('../util');
var _ = require('underscore');

function assign(list,value) {
	var a = [];
	_.each(list, function(l) {
		a.push({
			_id: l,
			up: value
		})
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
function findOneById( id, collection, callback ) {
	if ( id ) {
		var obj = typeof(id) === 'string' ? 
						  util.toObjectId(id) : id;
		var query = {_id:obj};
		findOne( query, collection, callback );
	} else {
		callback( null );
	}
};

function findOne( query, collection, callback ) {
	connection.getInstance(function(db) {
		var collectiondb = db[collection]();
		collectiondb.findOne(query, function(err, obj) {
			if ( err ) throw err;
			db.close();
			callback(obj);
		});
	});
};

/**
 * @param user is the user ID as a string
 */
exports.getUser = function( userid, callback ) {
	findOneById(userid, 'users', callback);
};

exports.getGame = function( gameid, callback ) {
	findOneById(gameid, 'games', callback);
};

exports.getCharacter = function( characterid, callback ) {
	findOneById(characterid, 'characters', callback);
};

exports.getBoard = function( boardid, callback ) {
	findOneById(boardid, 'boards', callback );
};

/**
 * @param boardid is an object id of the board
 * @param character is a string id of the character
 */
exports.getBoardByCharacter = function( boardid, characterid, callback ) {
	characterid = util.toObjectId(characterid);
	var query = {
		_id: boardid,
		characters: {$all:[characterid]}
	};

	findOne( query, 'boards', callback );
};

var createNewGame = function( user, res ) {
	// 1. search for a user to play against
	// 2. select the board from which they will play
	// 3. start the game, and return enough info to the client
	connection.getInstance(function( db ) {
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
	});
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
		var player_characters = assign(board.characters, true);
		
		var game = {
			players: [user._id, opponent._id],
			board: board._id,
			selected_characters: [],
			turn: user._id,
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

	if ( opponent ) {
		createNewGameWithUser( user, person, db, res );
	} else {
		createNewGame( user, res );
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

	// TODO: If its the opponent that's setting the
	//       character, you don't want to change the turn
	//       since they have to also ask a question
	var nextturn = extractOpponent(user, game);
	connection.getInstance(function(db) {
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
	});	
};

/**
 * TODO: If the action is a guess, we should set the game to ended
 *       and we should return that the user guessed right in the 
 *       response
 *
 * TODO: Should probably support setting the player's board so that
 *       a user can also set their board while posting an action.
 */
exports.postAction = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var action = req.action;
	var value = req.value;

	var nextturn = extractOpponent(user, game);
	var playerid = action === 'reply' ? extractOpponent(user, game) : user._id;
	connection.getInstance(function(db) {
		var gamesdb = db.games();
		var query = {
			_id: game._id,
			'actions.player': playerid
		};
		var actionitem = {
			action:action,
			value:value,
			by: user._id
		};
		// TODO: Augment this to set the player board if it was
		//       passed in
		var update = {
			$push: { 'actions.$.list': actionitem },
			$set: { turn: nextturn }
		};
		var options = { upsert:false, 'new':true };
		var sort = [['_id','1']];
		gamesdb.findAndModify(query, sort, update, options, function(err, insertedaction) {
			if ( err ) throw err;

			db.close();
			res.json(actionitem);
		});
	});
};

exports.updateBoard = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var board = req.board;
	var player_board = req.player_board;

	var nextturn = extractOpponent(user, game);
	connection.getInstance(function(db) {
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

			var result = _.find(game.player_board, function(pb) {
				return playerid.equals(pb.player);
			});

			db.close();

			// TODO: I should probably also return the game id
			res.json(result);
		});		
	});
};

exports.guess = function( req, res ) {
	var user = req.user;
	var game = req.game;
	var character = req.character;

	connection.getInstance(function(db) {
		var gamesdb = db.games();
		var playerid = user._id;
		var opponent = extractOpponent(user, game);
		res.json(401,{error:'guess not implemented'});
	});
};