var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var connection = require('../routes/database')
var util = require('./util.test');

describe('Login', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/login'
	};

	before(function(done) {
		util.resetDb(function() {
			done();
		});
	});

	// it('should create a new game with random character', function( done ) {
	// 	util.createLogin(url, function(res) {
	// 		var token1 = res.body.token;
	// 		util.createLogin(url, function(res) {
	// 			done();
	// 		});
	// 	});
	// });
});