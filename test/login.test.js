var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('./testutil');
var DbBuilder = require('../routes/dbutil').DbBuilder;

describe('Login', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/login'
	};

	beforeEach(function(done) {
		new DbBuilder().build(function() {
			done();
		});
	});

	it('should create new token when none is given', function(done) {
		util.post(url, function(res) {
			res.body.should.have.property('name');
			res.body.should.have.property('token');
			res.body.should.have.property('id');
			done();
		})
	});

	it('should return the same user if an existing token is given', function(done) {
		util.post(url, function(res) {
			var token = res.body.token;
			var name = res.body.name;
			var id = res.body.id;
			var data = {
				token: token,
			};

			request(url.domain)
				.post(url.subdomain)
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

		util.post(url, data, function(res) {
			res.status.should.equal(404);
			done();
		});
	});

});