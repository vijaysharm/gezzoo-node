var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var toObjectId = util.toObjectId;
var Game = require('../routes/game.util').Game;
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./util.test');

describe('Asking Question', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games/5286e01d9beb41000000001c/question'
	};

	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';
	var boardid = '5286fd942200ab0000000002';
	var board = [
		{_id: toObjectId('5286e01d8b587b0000000001'), up:true},
		{_id: toObjectId('5286e01d8b587b0000000002'), up:true},
		{_id: toObjectId('5286e01d8b587b0000000003'), up:true},
		{_id: toObjectId('5286e01d8b587b0000000004'), up:true}
	];

	function getUsers() {
		return [
			{ username:'gezzoo_0', _id:toObjectId(token1) },
			{ username:'gezzoo_1', _id:toObjectId(token2) }
		];
	};

	function getBoards() {
		return [
			{
				_id : toObjectId(boardid),
				name : "test", 
				characters : [ board[0]._id, board[1]._id, board[2]._id, board[3]._id ]
			}
		];
	};

	function getCharcters() {
		return [
			{ name:'person 1', category:['test'], img:'1.jpg', _id:board[0]._id) },
			{ name:'person 2', category:['test'], img:'2.jpg', _id:board[1]._id) },
			{ name:'person 3', category:['test'], img:'3.jpg', _id:board[2]._id) },
			{ name:'person 4', category:['test'], img:'4.jpg', _id:board[3]._id) }
		];
	};

	function getGame() {
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

		// it('', function(done) {
		// 	var data = { 
		// 		token: token1,
		// 	};

		// 	testutil.post(url, data, function(res) {
				
		// 		done();
		// 	});
		// });
	describe('', function() {
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

		it('', function(done) {
			var data = { 
				token: token1,
				question: 'Love pizza?'
			};

			testutil.post(url, data, function(res) {
				
				done();
			});
		});
	})

	// it('should not let the user guess with an invalid character', function(done) {
	// 	var data = { 
	// 		token: token1,
	// 		character: '5286e01d8b587b0000000000'
	// 	};

	// 	testutil.post(url, data, function(res) {
	// 		res.status.should.equal(401);
	// 		res.body.should.equal('Invalid character object');
	// 		done();
	// 	});
	// });

	// it('should not let the user guess if player two has no character set', function(done) {
	// 	var data = { 
	// 		token: token1,
	// 		character: character_id[1]
	// 	};

	// 	testutil.post(url, data, function(res) {
	// 		res.status.should.equal(401);
	// 		res.body.should.equal('Character not set');
	// 		done();
	// 	});
	// });

	// describe('with opponent character set', function() {
	// 	function getGame() {
	// 		var board = [
	// 			{_id: toObjectId(character_id[0]), up:true},
	// 			{_id: toObjectId(character_id[1]), up:true},
	// 			{_id: toObjectId(character_id[2]), up:true},
	// 			{_id: toObjectId(character_id[3]), up:true}
	// 		];

	// 		var game = new Game('5286e01d9beb41000000001c')
	// 			.board(boardid)
	// 			.addPlayer({
	// 				id: token1,
	// 				board: board,
	// 				character: character_id[0]
	// 			})
	// 			.addPlayer({
	// 				id: token2,
	// 				board: board,
	// 				character: character_id[1]
	// 			})
	// 			.turn(token1)
	// 			.toDbObject();

	// 		return [game];
	// 	};

	// 	beforeEach(function(done) {
	// 		new DbBuilder()
	// 			.addUsers(getUsers())
	// 			.addCharacters(getCharcters())
	// 			.addGames(getGame())
	// 			.addBoards(getBoards())
	// 			.build(function() {
	// 				done();
	// 			});
	// 	});

	// 	it('should let the user know when they guessed wrong', function(done) {
	// 		var data = { 
	// 			token: token1,
	// 			character:'5286e01d8b587b0000000001'
	// 		};

	// 		testutil.post(url, data, function(res) {
	// 			res.status.should.equal(200);
	// 			res.body.should.have.property('gameid', '5286e01d9beb41000000001c');
	// 			res.body.should.have.property('guess', false);
	// 			done();
	// 		});
	// 	});

	// 	it('should let the user know when they guessed right', function(done) {
	// 		var data = { 
	// 			token: token1,
	// 			character:'5286e01d8b587b0000000002'
	// 		};

	// 		testutil.post(url, data, function(res) {
	// 			res.status.should.equal(200);
	// 			res.body.should.have.property('gameid', '5286e01d9beb41000000001c');
	// 			res.body.should.have.property('guess', true);
	// 			done();
	// 		});
	// 	});

	// 	it('should not let the user set the board if board is invalid', function(done) {
	// 		var data = { 
	// 			token: token1,
	// 			character:'5286e01d8b587b0000000002',
	// 			player_board: [
	// 				{_id: toObjectId(character_id[0]), up:true},
	// 				{_id: toObjectId(character_id[1]), up:false},
	// 				{_id: toObjectId(character_id[2]), up:true},
	// 				// This is not on the board
	// 				{_id: toObjectId(character_id[0]), up:false}
	// 			]
	// 		};

	// 		testutil.post(url, data, function(res) {
	// 			res.status.should.equal(401);
	// 			res.body.should.equal('Player board is not valid.');
	// 			done();
	// 		});
	// 	});

	// 	it('should let the user set the board', function(done) {
	// 		var data = { 
	// 			token: token1,
	// 			character:'5286e01d8b587b0000000002',
	// 			player_board: [
	// 				{_id: toObjectId(character_id[0]), up:true},
	// 				{_id: toObjectId(character_id[1]), up:false},
	// 				{_id: toObjectId(character_id[2]), up:true},
	// 				{_id: toObjectId(character_id[3]), up:false}
	// 			]
	// 		};

	// 		testutil.post(url, data, function(res) {
	// 			res.status.should.equal(200);
	// 			res.body.should.have.property('gameid', '5286e01d9beb41000000001c');
	// 			res.body.should.have.property('guess', true);
	// 			done();
	// 		});
	// 	});
	// });
});