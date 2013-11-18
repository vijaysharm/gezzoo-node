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

var initializeBoards = function( category, boards, db, callback ) {
	var boardsdb = db.boards();
	var charactersdb = db.characters();
	boardsdb.drop();

	if ( boards && boards.length > 0 ) {
		boardsdb.insert(boards, function(err, results) {
			if ( err ) throw err;
			callback();
		});
	} else if ( category ) {
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
	this.category = null;
	this.boards = [];
	this.characters = [];
	this.games = [];
	this.users = [];
	var that = this;

	this.add = function(a, col) {
		if ( isArray(a) ) {
			that[col] = that[col].concat(a);
		} else {
			that[col].push(a);
		}
	};

	return {
		setCategory: function( c ) {
			that.category = c;
			return this;
		},
		addBoards: function( b ) {
			that.add(b,'boards');
			return this;
		},
		addCharacters: function( c ) {
			that.add(c,'characters');
			return this;
		},
		addUsers: function( u ) {
			that.add(u,'users');
			return this;
		},
		addGames: function( g ) {
			that.add(g,'games');
			return this;
		},
		build: function(callback) {
			connection.getInstance(function(db) {
				insertUsers( that.users, db, function() {
					initializeCounter( that.users, db, function() {
						initializeCharacters( that.characters, db, function() {
							initializeBoards( that.category, that.boards, db, function() {
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
