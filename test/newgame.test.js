var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./util.test');

/**
 * TODO: Need to test when creating a game with an opponent
 * 		 and an existing game that's not ended exists.
 *
 * TODO: Test when creating new game that its not created with
 *       a user that already has an existing game.
 */
describe('New Game', function() {
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
			{ name:'person 1', category:['test'], img:'1.jpg', _id:util.toObjectId('5286e01d8b587b0000000001') },
			{ name:'person 2', category:['test'], img:'2.jpg', _id:util.toObjectId('5286e01d8b587b0000000002') },
			{ name:'person 3', category:['test'], img:'3.jpg', _id:util.toObjectId('5286e01d8b587b0000000003') },
			{ name:'person 4', category:['test'], img:'4.jpg', _id:util.toObjectId('5286e01d8b587b0000000004') }
		];
	};

	function assertGame( game ) {
		game.should.have.property('players');
		game.players.should.have.length(2);
		game.players.should.include(token1);
		game.players.should.include(token2);
		game.should.have.property('turn', token1);
		game.should.have.property('opponent');
		game.opponent.should.have.property('_id', token2);
		game.opponent.should.have.property('username', 'gezzoo_1');
		game.should.have.property('_id');
		game.should.have.property('board');
		game.should.have.property('player_board');
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

	/*
	{
		"players":[
			"52728ca9954deb0b31000004",
			"52728fbf63a64c904c657ed5"
		],
		"opponent":{
			"username":"gezzoo_1",
			"_id":"52728fbf63a64c904c657ed5"
		},
		"turn":"52728ca9954deb0b31000004",
		"_id":"5286e01d9beb41000000001c",
		"board":{
			"name":"test",
			"characters":[
				{"name":"person 1","img":"1.jpg","_id":"5286e01d8b587b0000000001"},
				{"name":"person 2","img":"2.jpg","_id":"5286e01d8b587b0000000002"},
				{"name":"person 3","img":"3.jpg","_id":"5286e01d8b587b0000000003"},
				{"name":"person 4","img":"4.jpg","_id":"5286e01d8b587b0000000004"}
			],
			"_id":"5286e01d8b587b0000000005"
		},
		"player_board":[
			{"_id":"5286e01d8b587b0000000001","up":true},
			{"_id":"5286e01d8b587b0000000002","up":true},
			{"_id":"5286e01d8b587b0000000003","up":true},
			{"_id":"5286e01d8b587b0000000004","up":true}
		]
	}
	*/

	it('should create a new game with random character', function( done ) {
		var data = { token: token1 };
		testutil.post(url, data, function(res) {
			// console.log(JSON.stringify(res.body));
			assertGame(res.body);
			done();
		});
	});

	it('should create a new game with a given opponent', function(done) {
		var data = { token: token1, opponent: token2 };
		testutil.post(url, data, function(res) {
			// console.log(JSON.stringify(res.body));
			assertGame(res.body);
			done();
		});		
	});
});