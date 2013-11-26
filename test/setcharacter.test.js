var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var toObjectId = util.toObjectId;
var Game = require('../routes/game.util').Game;
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./testutil');

describe('Set Character', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games/5286e01d9beb41000000001c/character'
	};

	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';
	var boardid = '5286fd942200ab0000000002';
	var character_id = [
		'5286e01d8b587b0000000001',
		'5286e01d8b587b0000000002',
		'5286e01d8b587b0000000003',
		'5286e01d8b587b0000000004'
	];

	function getUsers() {
		return [
			{ username:'gezzoo_0', _id:util.toObjectId(token1) },
			{ username:'gezzoo_1', _id:util.toObjectId(token2) }
		];
	};

	function getBoards() {
		return [
			{
				_id : util.toObjectId(boardid),
				name : "test", 
				characters : [ 	
					util.toObjectId(character_id[0]),
					util.toObjectId(character_id[1]),
					util.toObjectId(character_id[2]),
					util.toObjectId(character_id[3])
				]
			}
		];
	};

	function getCharcters() {
		return [
			{ name:'person 1', category:['test'], img:'1.jpg', _id:util.toObjectId(character_id[0]) },
			{ name:'person 2', category:['test'], img:'2.jpg', _id:util.toObjectId(character_id[1]) },
			{ name:'person 3', category:['test'], img:'3.jpg', _id:util.toObjectId(character_id[2]) },
			{ name:'person 4', category:['test'], img:'4.jpg', _id:util.toObjectId(character_id[3]) }
		];
	};

	function getGame() {
		var board = [
			{_id: toObjectId(character_id[0]), up:true},
			{_id: toObjectId(character_id[1]), up:true},
			{_id: toObjectId(character_id[2]), up:true},
			{_id: toObjectId(character_id[3]), up:true}
		];

		var game = new Game('5286e01d9beb41000000001c')
			.board(boardid)
			.addPlayer({
				id: token1,
				board: board
			})
			.addPlayer({
				id: token2,
				board: board
			})
			.turn(token1)
			.toDbObject();

		return [game];
	};

	beforeEach(function(done) {
		new DbBuilder()
			.addUsers(getUsers())
			.addCharacters(getCharcters())
			.addGames(getGame())
			.addBoards(getBoards())
			.build(function() {
				done();
			});
	});

	it('should return 401 if an invalid game ID is given', function(done) {
		var url = {
			domain: 'http://localhost:3000',
			subdomain: '/api/games/5286e01d8b587b0000000004/character'
		};
		var data = { token: token1 };

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('No game with ID 5286e01d8b587b0000000004');
			done();
		});
	});

	it('should return 401 if no character is given', function(done) {
		var data = { token: token1 };

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('Invalid character object');
			done();
		});
	});

	it('should return 401 if character is not from the game board', function(done) {
		var data = { 
			token: token1,
			character:'5286e01d8b587b0000000000'
		};

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('Invalid character object');
			done();
		});
	});

	it('should not let user 2 set their character', function(done) {
		var data = { 
			token: token2,
			character:'5286e01d8b587b0000000001'
		};

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('Not your turn');
			done();
		});
	});	

	it('should let user 1 set their character', function(done) {
		var data = { 
			token: token1,
			character:'5286e01d8b587b0000000001'
		};

		testutil.post(url, data, function(res) {
			res.status.should.equal(200);
			done();
		});
	});
});