var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/gezzoo';

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
		}
	};
};

exports.getInstance = function( callback ) {
	mongo.Db.connect( mongoUri, function( err, db ) {
		if( err ) throw err;
		callback( wrapdb(db) );
	});
};
