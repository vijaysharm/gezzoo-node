var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var toObjectId = util.toObjectId;
var Game = require('../routes/game.util').Game;
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./testutil');
var _ = require('underscore');

describe('Get Games', function() {
	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';
	var token3 = '52728fbf63a64c904c657ea6';

	var gameid = '5286e01d9beb41000000001c';
	var gameid2 = '5286e01d9beb41000b00003a';
	var boardid = '5286fd942200ab0000000002';
	var board = [
		{_id: toObjectId('5286e01d8b587b0000000001'), up:true},
		{_id: toObjectId('5286e01d8b587b0000000002'), up:true},
		{_id: toObjectId('5286e01d8b587b0000000003'), up:true},
		{_id: toObjectId('5286e01d8b587b0000000004'), up:true}
	];

	function getUrl(id) {
		return {
			domain: 'http://localhost:3000',
			subdomain: '/api/games/' + id
		};
	};

	function getUsers() {
		return [
			{ username:'gezzoo_0', _id:toObjectId(token1) },
			{ username:'gezzoo_1', _id:toObjectId(token2) },
			{ username:'gezzoo_2', _id:toObjectId(token3) }
		];
	};

	function getBoards() {
		var characterids = _.pluck(board, '_id');
		return [{
			_id : toObjectId(boardid),
			name : "test", 
			characters : characterids
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

	describe('by IDs', function() {
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
					character: board[1]._id,
					actions: actionids
				})
				.turn(token1)
				.toDbObject();
			var otherGame = new Game(gameid2)
				.board(boardid)
				.addPlayer({
					id: token3,
					board: board,
					character: board[0]._id
				})
				.addPlayer({
					id: token2,
					board: board,
					character: board[1]._id,
					actions: actionids
				})
				.turn(token2)
				.toDbObject();
			return [game, otherGame];
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

		it('should fail if the game requested is not for the given user token', function(done) {
			testutil.get(getUrl(gameid2), token1, function(res) {
				res.status.should.equal(401);
				res.body.should.equal('No game with ID 5286e01d9beb41000b00003a');
				done();
			});
		});

		it('should return a full game object', function(done) {
			testutil.get(getUrl(gameid), token1, function(res) {
				res.body.should.have.property('_id', gameid);
				res.body.should.have.property('me');
				res.body.should.have.property('opponent');
				res.body.should.have.property('board');
				res.body.should.have.property('turn');
				res.body.should.have.property('ended');

				res.body.me.should.have.property('username');
				res.body.me.should.have.property('_id');
				res.body.me.should.have.property('board');
				res.body.me.should.have.property('character');
				res.body.me.should.have.property('actions');

				res.body.opponent.should.have.property('username');
				res.body.opponent.should.have.property('_id');
				res.body.opponent.should.not.have.property('board');
				res.body.opponent.should.not.have.property('character');
				res.body.opponent.should.have.property('actions');
				done();
			});
		});

		it('should return a list of games', function(done) {
			testutil.get(getUrl(''), token2, function(res) {
				console.log(res.body);
				done();
			});
		})
	});
});
