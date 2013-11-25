var util = require('../routes/util');
var Game = require('../routes/game.util').Game;
var toObjectId = util.toObjectId;
var should = require('should'); 

describe('Game Util', function() {
	var gameid = toObjectId('5286e01d9beb41000000001c');

	it('should create a single object array for db', function() {
		var game = new Game(gameid).toDbObject();
		game.should.have.property('_id', gameid);
		game.should.have.property('players');
		game.players.should.be.empty;
		game.should.have.property('ended', false);
		game.should.have.property('board', null);
		game.should.have.property('actions');
		game.actions.should.be.empty;
		game.should.have.property('player_board');
		game.player_board.should.be.empty;
		game.should.have.property('selected_characters');
		game.selected_characters.should.be.empty;
	});

	it('should set the ended property', function() {
		var game = new Game(gameid)
			.ended(true)
			.toDbObject();
		game.should.have.property('ended', true);
	});	

	it('should set the board ID property', function() {
		var boardid = toObjectId('5286e01d9beb41000000001a');
		var game = new Game(gameid)
			.board(boardid)
			.toDbObject();

		game.should.have.property('board', boardid);
	});

	it('should set the turn property', function() {
		var turnid = toObjectId('5286e01d9beb41000000001a');
		var game = new Game(gameid)
			.turn(turnid)
			.toDbObject();
		
		game.should.have.property('turn', turnid);
	});

	it('should add a player by object ID', function() {
		var player = toObjectId('5286e01d9beb41000000001a');
		var game = new Game(gameid)
			.addPlayer(player)
			.toDbObject();

		game.should.have.property('players');
		game.players.should.have.length(1);
		game.should.have.property('actions');
		game.actions.should.have.length(1);
		game.should.have.property('selected_characters');
		game.selected_characters.should.be.empty;
	});

	it('should add a player by object literal', function() {
		var game = new Game(gameid)
			.addPlayer({
				id: toObjectId('5286e01d9beb41000000001a')
			})
			.toDbObject();
		game.should.have.property('players');
		game.players.should.have.length(1);
		game.should.have.property('actions');
		game.actions.should.have.length(1);
		game.should.have.property('selected_characters');
		game.selected_characters.should.be.empty;
	});

	it('should add all player properties by object literal', function() {
		var game = new Game(gameid)
			.addPlayer({
				id: toObjectId('5286e01d9beb41000000001a'),
				character: toObjectId('5286e01d9beb41000000001e')
			})
			.toDbObject();

		game.should.have.property('players');
		game.players.should.have.length(1);
		game.should.have.property('actions');
		game.actions.should.have.length(1);
		game.should.have.property('selected_characters');
		game.selected_characters.should.have.length(1);
	});

	it('should build a full object for db storage', function() {
		var boardid = toObjectId('5286e01d9beb41000000001a');
		var board = [
			{_id: toObjectId('5286e01d8b587b0000000001'), up:true},
			{_id: toObjectId('5286e01d8b587b0000000002'), up:true},
			{_id: toObjectId('5286e01d8b587b0000000003'), up:true},
			{_id: toObjectId('5286e01d8b587b0000000004'), up:true}
		];

		var user1 = {
			id: toObjectId('5286e01d9beb41000000001a'),
			board: board
		};
		var user2 = {
			id: toObjectId('5286e01d9beb41000000001b'),
			board: board
		}

		var game = new Game(gameid)
			.board(boardid)
			.turn(user1.id)
			.addPlayer(user1)
			.addPlayer(user2)
			.toDbObject();

		game.should.have.property('_id', gameid);
		game.should.have.property('players');
		game.players.should.have.length(2);
		game.should.have.property('ended', false);
		game.should.have.property('board', boardid);
		game.should.have.property('turn', user1.id);
		game.should.have.property('actions');
		game.actions.should.have.length(2);
		game.should.have.property('player_board');
		game.player_board.should.have.length(2);
		game.should.have.property('selected_characters');
		game.selected_characters.should.be.empty;
	});
});