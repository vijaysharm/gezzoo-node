var login = require('./login');
var _ = require('underscore');
var connection = require('./database');
var util = require('./util');

function getDb( req, res, next ) {
	connection.getInstance(function(db) {
		req.db = db;
		res.on('finish', function() {
			req.db.close();
		});
		next();
	});
};

function authenticate( req, res, next ) {
	login.authenticate( req, res, next );
};

function query( q, db, res ) {
	db.find(q).toArray(function(err, result) {
		if ( err ) {
			res.json(200, {
				result: 'failure',
				data: err
			})
		} else {
			res.json(200, {
				result: 'success',
				data: result
			})
		}
	});
};

function games( req, res ) {
	var q = {};
	var gameid = util.extract(req, 'gameid')
	if ( gameid ) { q._id = util.toObjectId(gameid); }

	query( q, req.db.games(), res );
};

function actions( req, res ) {
	var q = {};
	var gameid = util.extract(req, 'gameid')
	if ( gameid ) { q.gameid = util.toObjectId(gameid); }

	query( q, req.db.actions(), res );
};

// TODO: This needs to block requests from 
// 		 unauthenticated users
exports.install = function( app ) {
	app.get('/admin/api/games', getDb, games);
	app.get('/admin/api/games/:gameid', getDb, games);
	app.get('/admin/api/actions', getDb, actions);
	app.get('/admin/api/actions/:gameid', getDb, actions);
};