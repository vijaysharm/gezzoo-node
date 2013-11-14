var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var connection = require('../routes/database')

describe('Login', function() {
	var url = 'http://localhost:3000';

	function createLogin(data, callback) {
		if ( arguments.length === 1 ) {
			callback = data;
			data = {};
		}

		request(url)
			.post('/api/login')
			.send(data)
			.end(function(err, res) {
				if(err) throw err;
				callback(res);
			});
	};

	before(function(done) {
		connection.getInstance(function(db) {
			db.users().drop();
			db.games().drop();
			db.boards().drop();
			db.characters().drop();
			db.counters().drop();
			db.counters().insert({ _id:'userid', seq: 1 }, function(err, result) {
				if ( err ) throw err;
				db.close();
				done();
			});
		});
	});


});