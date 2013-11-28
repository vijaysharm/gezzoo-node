var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var wrapdb = function( db ) {
	return {
		counters: function() {
			return db.collection('counters');
		},
		users: function() {
			return db.collection('users');
		},
		games: function() {
			return db.collection('games');
		},
		boards: function() {
			return db.collection('boards');
		},
		characters: function() {
			return db.collection('characters');
		},
		actions: function() {
			return db.collection('actions');
		},
		close: function() {
			db.close();
		}
	};
};

exports.getInstance = function( callback ) {
	if ( process.env.MONGOLAB_URI ) {
		Db.connect( process.env.MONGOLAB_URI, function(err, db) {
			if( err ) throw err;
			callback(wrapdb( db ));
		});
	} else {
		// mongodb://localhost/gezzoo
		var options = {safe: false, strict: true, fsync:true, journal:true};
		var db = new Db('gezzoo', new Server('127.0.0.1', 27017, {}), options);
		db.open(function(err, db) {
			if( err ) throw err;
			callback(wrapdb( db ));
		});
	}
};
