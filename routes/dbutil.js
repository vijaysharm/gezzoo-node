var connection = require('./database')
var _ = require('underscore');

var initializeCounter = function( users, db, callback ) {
	var countersdb = db.counters();
	countersdb.drop();

	var count = users ? users.length : 0;
	countersdb.insert({ _id:'userid', seq: count }, function(err, result) {
		if ( err ) throw err;
		callback();
	});
};

var insertUsers = function( users, db, callback ) {
	var usersdb = db.users();
	usersdb.drop();
	if ( users && users.length > 0 ) {
		usersdb.insert( users, function( err, result ) {
			if ( err ) throw err;
			callback();
		});
	} else {
		callback();
	}
};

var initializeGames = function( games, db, callback ) {
	var gamesdb = db.games();
	gamesdb.drop();
	if ( games && games.length > 0 ) {
		gamesdb.insert( games, function( err, result ) {
			if ( err ) throw err;
			callback();
		});
	} else {
		callback();
	}
};

var createBoard = function( name, characters ) {
	return {
		name: name,
		characters: characters
	};
};

var initializeBoards = function( category, db, callback ) {
	var boardsdb = db.boards();
	var charactersdb = db.characters();
	boardsdb.drop();

	if ( category ) {
		var query = {category:{$all:[ category ]}};
		charactersdb.find(query).limit(24).toArray(function(err, characters) {
			if ( err ) throw err;
			var charids = _.pluck(characters,'_id');
			var board = createBoard(category, charids);
			boardsdb.insert(board, function(err, insertedboard) {
				if ( err ) throw err;
				callback();
			})
		});
	} else {
		callback();
	}
};

var initializeCharacters = function( characters, db, callback ) {
	var charactersdb = db.characters();
	charactersdb.drop();
	if ( characters && characters.length > 0 ) {
		charactersdb.insert(characters, function(err, result) {
			if ( err ) throw err;
			callback();
		});
	} else {
		callback();
	}
};

function isArray( a ) {
	return (Object.prototype.toString.call( a ) === '[object Array]');
};

exports.DbBuilder = function() {
	this.board_category = null;
	this.characters = [];
	this.games = [];
	this.users = [];
	var that = this;
	return {
		setCategory: function( c ) {
			that.board_category = c;
			return this;
		},
		addCharacters: function( c ) {
			if( isArray(c) ) {
				that.characters = that.characters.concat( c );
			} else {
				that.characters.push( c );
			}
			return this;
		},
		addUsers: function( u ) {
			if( isArray(u) ) {
				that.users = that.users.concat( u );
			} else {
				that.users.push( u );
			}
			return this;
		},
		addGames: function( g ) {
			if ( isArray(g) ) {
				that.games = that.games.concat( g );
			} else {
				that.games.push( g );
			}
			return this;
		},
		build: function(callback) {
			connection.getInstance(function(db) {
				insertUsers( that.users, db, function() {
					initializeCounter( that.users, db, function() {
						initializeCharacters( that.characters, db, function() {
							initializeBoards( that.board_category, db, function() {
								initializeGames( that.games, db, function() {
									db.close();
									callback();
								});
							});
						});
					});
				});
			});
		}
	};
};
