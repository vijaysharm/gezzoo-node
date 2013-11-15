var util = require( './util');
var connection = require('./database');
var BSON = require('mongodb').BSONPure;

function createSerializedUser( user ) {
	return {
		name: user.username,
		token: user._id,
		id: user._id
	};
};

function findToken( db, token, callback ) {
	if (util.isObjectId( token )) {
		if ( token ) {
			var usersdb = db.users();
			var query = { _id: util.toObjectId(token) };
			usersdb.find(query).toArray(function(err, users) {
				if ( err ) throw err;
				callback( null, users[0] );
			});
		} else {
			callback( 'No token provided' );
		}
	} else {
		callback( 'Token is not valid type' );
	}
};

function getDb( req, res, next ) {
	connection.getInstance(function(db) {
		req.db = db;
		next();
	});
};

/**
 * This method should check if a token is passed in. If it is, 
 * it should query and return the user information (name?). If
 * there is none is provided, it should create a new token, and 
 * a new user and return this new user back in the response.
 * 
 * TODO: What happens if they attempt to login with a token that 
 *       cannot be found? -- should you just create a new user and
 *       return that user? Note that you should also probably support
 *       logging in by the gezzoo id, and by facebook id.
 */
var login = function( req, res ) {
	var token = util.extractToken( req );
	var db = req.db;

	if ( token ) {
		findToken( db, token, function(err, user) {
			db.close();
			req.user = user;
			if ( user ) {
				res.json(createSerializedUser( user ));
			} else {
				res.send(404, 'Token not found: ' + token);
			}
		});
	} else {
		var countersdb = db.counters();
		var usersdb = db.users();

		var query = { _id:'userid' };
		var update = {$inc:{ seq: 1 }};
		var sort = [['userid','1']];
        var options = {'new':true};

		countersdb.findAndModify(query, sort, update, options, function( err, usercount ) {
			if ( err ) throw err;
			var newuser = {
				username: 'gezzoo_' + usercount.seq
			};

			usersdb.insert( newuser, function( err, inserteduser ) {
				var user = inserteduser[0];

				// Here, im using the _id of the record as the session 
				// token, this should probably be changed to being different 
				// so that you can have multiple logged in sessions
				db.close();
				req.user = user;
				res.json(createSerializedUser( user ));
			});
		});
	}
};

var logout = function( req, res ) {
	// Nothing to do here.
};

exports.authenticate = function( req, res, next ) {
	var token = util.extractToken( req );
	var db = req.db;
	findToken( db, token, function(err, user) {
		req.user = user;
		if ( user ) {
			next();
		} else {
			res.json(401, { error:'User not found with token: ' + token });
		}
	});
};

exports.install = function( app ) {
	app.post('/api/login', getDb, login );
};