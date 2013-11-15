var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./util.test');

describe('Login', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games'
	};
	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';

	function getUsers() {
		return [
			{ username:'gezzoo_0', _id:util.toObjectId(token1) },
			{ username:'gezzoo_1', _id:util.toObjectId(token2) }
		];
	};

	function getCharcters() {
		return [
			{name:'person 1', category:['test'], img:'1.jpg'},
			{name:'person 2', category:['test'], img:'2.jpg'},
			{name:'person 3', category:['test'], img:'3.jpg'},
			{name:'person 4', category:['test'], img:'4.jpg'}
		];
	};

	before(function(done) {
		new DbBuilder()
			.addUsers(getUsers())
			.addCharacters(getCharcters())
			.setCategory('test')
			.build(function() {
				done();
			});
	});

	it('should create a new game with random character', function( done ) {
		var data = { token: token1 };
		testutil.post(url, data, function(res) {
			console.log(res.body);
			done();
		});
	});
});