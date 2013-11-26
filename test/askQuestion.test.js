var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var toObjectId = util.toObjectId;
var Game = require('../routes/game.util').Game;
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./testutil');

describe('Asking questions', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games/5286e01d9beb41000000001c/question'
	};

	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';
	var invalidToken = '52728fbf63a64c904c657e55'
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
			{ name:'person 1', category:['test'], img:'1.jpg', _id:board[0]._id },
			{ name:'person 2', category:['test'], img:'2.jpg', _id:board[1]._id },
			{ name:'person 3', category:['test'], img:'3.jpg', _id:board[2]._id },
			{ name:'person 4', category:['test'], img:'4.jpg', _id:board[3]._id }
		];
	};

	describe('when opponent does not have a character set', function() {
		function getGame() {
			var game = new Game('5286e01d9beb41000000001c')
				.board(boardid)
				.addPlayer({
					id: token1,
					board: board,
					character: board[0]._id
				})
				.addPlayer({
					id: token2,
					board: board,
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

		it('should fail if player 2 is asking because its not their turn', function(done) {
			var data = { 
				token: token2,
				question: 'Love pizza?'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('Not your turn');
				done();
			});
		});

		it('should fail with an invalid token', function(done) {
			var data = { 
				token: invalidToken,
				question: 'Love Pizza?'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.error.should.equal('User not found with token: 52728fbf63a64c904c657e55');
				done();
			});
		});

		it('should fail when character is not set', function(done) {
			var data = { 
				token: token1,
				question: 'Hi!'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('Character not set');
				done();
			});
		});
	});

	describe('when both players have characters set', function() {
		function getGame() {
			var game = new Game('5286e01d9beb41000000001c')
				.board(boardid)
				.addPlayer({
					id: token1,
					board: board,
					character: board[0]._id
				})
				.addPlayer({
					id: token2,
					board: board,
					character: board[1]._id
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

		it('should fail when no question is given', function(done) {
			var data = { 
				token: token1
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('No question provided');
				done();
			});
		});

		it('should fail when an empty question is given', function(done) {
			var data = { 
				token: token1,
				question: ' '				
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('No question provided');
				done();
			});
		});

		it('should pass if a question is asked', function(done) {
			var data = { 
				token: token1,
				question: 'Are you done?'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(200);
				res.body.should.have.property('gameid');
				done();
			});
		});

		it('should fail if an invalid board is given', function(done) {
			var data = { 
				token: token1,
				question:'question',
				player_board: [
					{_id: board[0]._id, up:true},
					{_id: board[1]._id, up:false},
					{_id: board[2]._id, up:true},
					// This is not on the board
					{_id: board[0]._id, up:false}
				]
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('Player board is not valid.');
				done();
			});
		});

		it('should pass if a question is given and a board is given', function(done) {
			var data = { 
				token: token1,
				question:'Question',
				player_board: [
					{_id: board[0]._id, up:true},
					{_id: board[1]._id, up:false},
					{_id: board[2]._id, up:true},
					{_id: board[3]._id, up:false}
				]
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(200);
				res.body.should.have.property('gameid');
				done();
			});
		});	
	});

	describe('when game has ended', function() {
		function getGame() {
			var game = new Game('5286e01d9beb41000000001c')
				.board(boardid)
				.addPlayer({
					id: token1,
					board: board,
					character: board[0]._id
				})
				.addPlayer({
					id: token2,
					board: board,
					character: board[1]._id
				})
				.ended(true)
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

		it('should fail', function(done) {
			var data = { 
				token: token1,
				question: 'Hi there!'
			};

			testutil.post(url, data, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('Game has ended. Cannot be modified');
				done();
			});
		});
	});
});