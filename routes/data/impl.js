var connection = require('../database');
var util = require('../util');
var engine = require('./engine');

/**
 * @param id can be a string ID, or object ID
 */
var findOneById = function( id, collection, callback ) {
	if ( id ) {
		var obj = typeof(id) === 'string' ? 
						  util.toObjectId(id) : id;
		var query = {_id:obj};
		findOne( query, collection, callback );
	} else {
		callback( null );
	}
};

var findOne = function( query, collection, callback ) {
	connection.getInstance(function(db) {
		var collectiondb = db[collection]();
		collectiondb.findOne(query, function(err, obj) {
			if ( err ) throw err;
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
		// console.log(JSON.stringify( query ));
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
		var game = {
			players: [user._id, opponent._id],
			board: board._id
		};

		gamesdb.insert(game, function(err, results) {
			var insertedgame = results[0];
			
			var returnedgame = {
				players: insertedgame.players,
				board: board,
				_id: insertedgame._id
			};
			res.json(returnedgame);
		});
	});
};

/**
 * @param user the user object from the users db
 * @param opponent the user object form the users db
 */
exports.startNewGame = function( user, opponent, res ) {
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
exports.setCharacter = function( user, game, character, res ) {
	var validate = engine.verifySetCharacter(user, game, character);
	if ( validate ) {
		res.json(401, { error: validate });
		return;
	}

	connection.getInstance(function(db) {
		var gamesdb = db.games();
		res.json({
			success:'you have it!'
		})
	});	
};

