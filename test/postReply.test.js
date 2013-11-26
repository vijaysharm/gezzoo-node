var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var toObjectId = util.toObjectId;
var Game = require('../routes/game.util').Game;
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./testutil');
var _ = require('underscore');

describe('Replying to questions', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games/5286e01d9beb41000000001c/reply'
	};

	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';
	var invalidToken = '52728fbf63a64c904c657e55';
	var gameid = '5286e01d9beb41000000001c';
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
		return [{
			_id : toObjectId(boardid),
			name : "test", 
			characters : [ board[0]._id, board[1]._id, board[2]._id, board[3]._id ]
		}];
	};

	function getCharcters() {
		return [
			{ name:'person 1', category:['test'], img:'1.jpg', _id:board[0]._id },
			{ name:'person 2', category:['test'], img:'2.jpg', _id:board[1]._id },
			{ name:'person 3', category:['test'], img:'3.jpg', _id:board[2]._id },
			{ name:'person 4', category:['test'], img:'4.jpg', _id:board[3]._id }
		];
	};

	function getActions() {
		var a1 = {
			_id: toObjectId('52728ca9954deb0b31000123'),
			gameid: toObjectId(gameid),
			action: 'question',
			value: 'Are you there?',
			by: toObjectId(token2),
			reply: {
				// date:
				value: 'Yes, im here'
			}
		};

		var a2 = {
			_id: toObjectId('52728ca9954deb0b31000124'),
			gameid: toObjectId(gameid),
			action: 'question',
			value: 'Are you there?',
			by: toObjectId(token2),
		};

		var a3 = {
			_id: toObjectId('52728ca9954deb0b31000125'),
			gameid: toObjectId(gameid),
			action: 'guess',
			value: board[1]._id,
			by: toObjectId(token2),
		};

		return [a1, a2, a3];
	};

	describe('', function() {
		var actionids = _.pluck(getActions(), '_id');
		function getGame() {
			var game = new Game(gameid)
				.board(boardid)
				.addPlayer({
					id: token1,
					board: board,
					character: board[0]._id
				})
				.addPlayer({
					id: token2,
					board: board,
					actions: actionids
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
				.addActions(getActions())
				.build(function() {
					done();
				});
		});

		it('', function(done) {
			var data = { 
				token: token1,
				question: toObjectId('52728ca9954deb0b31000123'),
				reply: 'Not tonight'
			};

			testutil.post(url, data, function(res) {
				console.log(res.body);
				// res.status.should.equal(401);
				// res.body.should.equal('Not your turn');
				done();
			});
			done();
		});
	});
});
