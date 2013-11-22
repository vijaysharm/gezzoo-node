var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var Game = require('../routes/game.util').Game;
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./util.test');

describe('Guessing', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games/5286e01d9beb41000000001c/guess'
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
			{_id: util.toObjectId(character_id[0]), up:true},
			{_id: util.toObjectId(character_id[1]), up:true},
			{_id: util.toObjectId(character_id[2]), up:true},
			{_id: util.toObjectId(character_id[3]), up:true}
		];

		var game = new Game('5286e01d9beb41000000001c')
			.board(boardid)
			.addPlayer({
				id: token1,
				board: board,
				character: character_id[0]
			})
			.addPlayer({
				id: token2,
				board: board,
			})
			.turn(token1)
			.toDbObject();
		return [game];
	};

	before(function(done) {
		new DbBuilder()
			.addUsers(getUsers())
			.addCharacters(getCharcters())
			.addGames(getGame())
			.addBoards(getBoards())
			.build(function() {
				done();
			});
	});

	it('should not let player 2 guess because its not their turn', function(done) {
		var data = { 
			token: token2,
			character: '5286e01d8b587b0000000001'
		};

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('Not your turn');
			done();
		});
	});

	it('should not let the user guess with an invalid character', function(done) {
		var data = { 
			token: token1,
			character: '5286e01d8b587b0000000000'
		};

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('Invalid character object');
			done();
		});
	});

	it('should not let the user guess if player two has no character set', function(done) {
		var data = { 
			token: token1,
			character: character_id[1]
		};

		testutil.post(url, data, function(res) {
			res.status.should.equal(401);
			res.body.should.equal('Character not set');
			done();
		});
	});

	describe('with opponent character set', function() {
		function getGame() {
			var board = [
				{_id: util.toObjectId(character_id[0]), up:true},
				{_id: util.toObjectId(character_id[1]), up:true},
				{_id: util.toObjectId(character_id[2]), up:true},
				{_id: util.toObjectId(character_id[3]), up:true}
			];

			var game = new Game('5286e01d9beb41000000001c')
				.board(boardid)
				.addPlayer({
					id: token1,
					board: board,
					character: character_id[0]
				})
				.addPlayer({
					id: token2,
					board: board,
					character: character_id[1]
				})
				.turn(token1)
				.toDbObject();

			return [game];
		};

		before(function(done) {
			new DbBuilder()
				.addUsers(getUsers())
				.addCharacters(getCharcters())
				.addGames(getGame())
				.addBoards(getBoards())
				.build(function() {
					done();
				});
		});

		it('should let the user know when they guessed wrong', function(done) {
			var data = { 
				token: token1,
				character:'5286e01d8b587b0000000001'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(200);
				res.body.should.have.property('gameid', '5286e01d9beb41000000001c');
				res.body.should.have.property('guess', false);
				done();
			});
		});

		it('should let the user know when they guessed right', function(done) {
			var data = { 
				token: token1,
				character:'5286e01d8b587b0000000002'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(200);
				res.body.should.have.property('gameid', '5286e01d9beb41000000001c');
				res.body.should.have.property('guess', true);
				done();
			});
		});			
	});

});