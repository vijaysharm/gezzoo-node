var connection = require('./database')
var _ = require('underscore');

function log(message) {
	console.log(message);
}

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
			log('Added ' + result.length + ' users');
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
			log('Added ' + result.length + ' games');
			callback();
		});
	} else {
		callback();
	}
};

function createBoard( name, characters ) {
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
			log('Added ' + results.length + ' boards');
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
				log('Added ' + insertedboard.length + ' board');
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
			log('Added ' + result.length + ' characters');
			callback();
		});
	} else {
		callback();
	}
};

var initializeActions = function( actions, db, callback ) {
	var actonsdb = db.actions();
	actonsdb.drop();
	if ( actions && actions.length > 0 ) {
		actonsdb.insert(actions, function(err, result) {
			if ( err ) throw err;
			log('Added ' + result.length + ' actions');
			callback();
		});
	} else {
		callback();
	}
};

function validate( db, callback ) {
	var actionsdb = db.actions();
	var charactersdb = db.characters();
	var boardsdb = db.boards();
	var usersdb = db.users();
	var gamesdb = db.games();
	var countersdb = db.counters();

	actionsdb.find({}).toArray(function(err, results) {
		if ( err ) throw err;
		console.log( results.length + ' actions found' );
		charactersdb.find({}).toArray(function(err, results) {
			if ( err ) throw err;
			console.log( results.length + ' characters found' );
			boardsdb.find({}).toArray(function(err, results) {
				if ( err ) throw err;
				console.log( results.length + ' boards found' );
				usersdb.find({}).toArray(function(err, results) {
					if ( err ) throw err;
					console.log( results.length + ' users found' );
					gamesdb.find({}).toArray(function(err, results) {
						if ( err ) throw err;
						console.log( results.length + ' games found' );
						countersdb.find({}).toArray(function(err, results) {
							console.log( results.length + ' counters found' );
							callback();
						});
					});
				});
			});
		});
	});
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
	this.actions = [];
	
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
		addActions: function( a ) {
			that.add(a,'actions');
			return this;
		},
		build: function(callback) {
			connection.getInstance(function(db) {
				initializeActions( that.actions, db, function() {
					insertUsers( that.users, db, function() {
						initializeCounter( that.users, db, function() {
							initializeCharacters( that.characters, db, function() {
								initializeBoards( that.category, that.boards, db, function() {
									initializeGames( that.games, db, function() {
										validate( db, function() {
											db.close();
											callback();
										});
									});
								});
							});
						});
					});
				});
			});
		}
	};
};
