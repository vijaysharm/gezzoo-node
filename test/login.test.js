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

	it('should create new token when none is given', function(done) {
		createLogin(function(res) {
			res.body.should.have.property('name');
			res.body.should.have.property('token');
			res.body.should.have.property('id');
			done();
		})
	});

	it('should return the same user if an existing token is given', function(done) {
		createLogin(function(res) {
			var token = res.body.token;
			var name = res.body.name;
			var id = res.body.id;
			var data = {
				token: token,
			};

			request(url)
				.post('/api/login')
				.send(data)
				.end(function(err, res) {
					if(err) throw err;
					res.body.should.have.property('name');
					res.body.name.should.equal(name);
					res.body.should.have.property('token');
					res.body.token.should.equal(token);
					res.body.should.have.property('id');
					res.body.id.should.equal(id);
					done();
				});
		});
	});

	it('should fail if an invalid token is given', function(done) {
		var data = {
			token: 'blah'
		};

		createLogin(data, function(res) {
			res.status.should.equal(404);
			done();
		});
	});	
});