var _ = require('underscore');
var toObjectId = require('./util').toObjectId;
var DbBuilder = require('./dbutil').DbBuilder;
var Game = require('./game.util').Game;
var ObjectID = require('mongodb').ObjectID;

var token1 = '52728ca9954deb0b31000004';
var token2 = '52728fbf63a64c904c657ed5';
var token3 = '52728fbf63a64c904c657ea6';
var token4 = '22728fbf63a64c904c657eaa';
var gameid = '5286e01d9beb41000000001c';
var gameid2 = '5286e01d9beb41000b00003a';
var boardid = '5286fd942200ab0000000002';
var all_actions = [];
var random_questions = [
	 {
		action: 'question',
		value: 'Are you there?',
		reply: {
			value: 'yes'
		}
	},
	{
		action: 'question',
		value: 'What does the fox say?',
	},
	{
		action: 'guess',
		value: toObjectId('5486e01d8b587b0000000001'),
	},
];

function getUsers() {
	return [
		{ username:'gezzoo_0', _id:toObjectId(token1) },
		{ username:'gezzoo_1', _id:toObjectId(token2) },
		{ username:'gezzoo_2', _id:toObjectId(token3) },
		{ username:'gezzoo_3', _id:toObjectId(token4) }
	];
};

function getBoards() {
	var characterids = _.pluck(getCharcters(), '_id');
	return [{
		_id : toObjectId(boardid),
		name : 'Bollywood', 
		characters : characterids
	}];
};

function getCharcters() {
	return [
		{_id:toObjectId('5386e01d8b587b0000000001'), name:'Shah Rukh Khan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTQxMjg4Mzk1Nl5BMl5BanBnXkFtZTcwMzQyMTUxNw@@._V1_SY317_CR1,0,214,317_.jpg'},
		{_id:toObjectId('5486e01d8b587b0000000001'), name:'Arjun Rampal', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTg0NTAzOTU4Ml5BMl5BanBnXkFtZTcwMzg1MjUyOA@@._V1_SX214_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5586e01d8b587b0000000001'), name:'Anupam Kher', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTY0MDkxMzkwN15BMl5BanBnXkFtZTcwODUxNTA5Nw@@._V1_SX214_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5686e01d8b587b0000000001'), name:'Sanjay Dutt', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNzU2NTgwNzY1OF5BMl5BanBnXkFtZTcwMjQxNzcxOA@@._V1_SY317_CR131,0,214,317_.jpg'},
		{_id:toObjectId('5786e01d8b587b0000000001'), name:'Hrithik Roshan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTU1MjQzNDExN15BMl5BanBnXkFtZTcwNzIxMTg0Mw@@._V1_SY317_CR173,0,214,317_.jpg'},
		{_id:toObjectId('5886e01d8b587b0000000001'), name:'Akshay Kumar', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTU4NzM4Nzk1OF5BMl5BanBnXkFtZTcwMTAwMTA1NA@@._V1_SY317_CR104,0,214,317_.jpg'},
		{_id:toObjectId('5986e01d8b587b0000000001'), name:'Salman Khan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTIyODQyOTA1M15BMl5BanBnXkFtZTcwMDQxNDIzMQ@@._V1_SY317_CR56,0,214,317_.jpg'},
		{_id:toObjectId('5a86e01d8b587b0000000001'), name:'Ranveer Singh', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTExOTcwMDU4NTReQTJeQWpwZ15BbWU3MDA0MjE1MTc@._V1_SY317_CR1,0,214,317_.jpg'},
		{_id:toObjectId('5b86e01d8b587b0000000001'), name:'Emraan Hashmi', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjExNzExNDY3OV5BMl5BanBnXkFtZTcwNzAyMTg2OA@@._V1_SY317_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5c86e01d8b587b0000000001'), name:'Amitabh Bachchan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNTk1OTUxMzIzMV5BMl5BanBnXkFtZTcwMzMxMjI0Nw@@._V1_SY317_CR8,0,214,317_.jpg'},
		{_id:toObjectId('5d86e01d8b587b0000000001'), name:'Abhishek Bachchan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTk1NjU1NjkxN15BMl5BanBnXkFtZTcwNDI4MDMzMg@@._V1_SY317_CR10,0,214,317_.jpg'},
		{_id:toObjectId('5e86e01d8b587b0000000001'), name:'John Abraham', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTY1MDUyMjI1N15BMl5BanBnXkFtZTYwMjg4MjA0._V1_SX214_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5f86e01d8b587b0000000001'), name:'Deepika Padukone', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjAxMTAwMTY2MV5BMl5BanBnXkFtZTcwOTM5NTQyMg@@._V1_SX214_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5316e01d8b587b0000000001'), name:'Katrina Kaif', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTUwODY3NzA3NF5BMl5BanBnXkFtZTcwNTEzNDg3OA@@._V1_SY317_CR6,0,214,317_.jpg'},		
		{_id:toObjectId('5326e01d8b587b0000000001'), name:'Anushka Sharma', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTc0NDMzMDYyM15BMl5BanBnXkFtZTcwMDEwMTA1NA@@._V1_SY317_CR104,0,214,317_.jpg'},
		{_id:toObjectId('5336e01d8b587b0000000001'), name:'Priyanka Chopra', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjAxNzUwNjExOV5BMl5BanBnXkFtZTcwNDUyMTUxNw@@._V1_SY317_CR105,0,214,317_.jpg'},
		{_id:toObjectId('5346e01d8b587b0000000001'), name:'Aishwarya Rai', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjEyMjEyODkzN15BMl5BanBnXkFtZTcwODkxMTY1Mg@@._V1_SX214_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5356e01d8b587b0000000001'), name:'Sonakshi Sinha', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BOTg3MzQxMTkwOF5BMl5BanBnXkFtZTcwNjcyOTM5NA@@._V1_SY317_CR18,0,214,317_.jpg'},
		{_id:toObjectId('5366e01d8b587b0000000001'), name:'Vidya Balan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNDI3Mjk2MjgzMl5BMl5BanBnXkFtZTcwODQwMjI1OQ@@._V1_SY317_CR3,0,214,317_.jpg'},
		{_id:toObjectId('5376e01d8b587b0000000001'), name:'Rani Mukerji', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTg0MTI5MDkyMV5BMl5BanBnXkFtZTcwNzIyMDQ4Mg@@._V1_SY317_CR111,0,214,317_.jpg'},
		{_id:toObjectId('5386e01d8b587b0000000002'), name:'Preity Zinta', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTQyMDc4NTE1Ml5BMl5BanBnXkFtZTcwOTQwMDgxOA@@._V1_SX214_CR0,0,214,317_.jpg'},
		{_id:toObjectId('5396e01d8b587b0000000002'), name:'Kajol', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNzIyNDI1MTYwMV5BMl5BanBnXkFtZTcwNzg5MzcxMw@@._V1_SY317_CR131,0,214,317_.jpg'},
		{_id:toObjectId('53a6e01d8b587b0000000001'), name:'Madhuri Dixit', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjI1MTMxMDMxMV5BMl5BanBnXkFtZTcwMTUzNzY3Nw@@._V1_SY317_CR18,0,214,317_.jpg'},
		{_id:toObjectId('53b6e01d8b587b0000000001'), name:'Juhi Chawla', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNzI1MzUxODczNV5BMl5BanBnXkFtZTcwNDUyNTA0MQ@@._V1_SY317_CR12,0,214,317_.jpg'}
	];
};

function createActions( gameid, by, actions, modified ) {
	var full_actions = [];

	for ( var c = 0; c < actions.length; c++ ) {
		var action = actions[c];
		var id = new ObjectID();
		var action_data = {
			_id: id,
			gameid: gameid,
			by: toObjectId(by),
		};
		var full_action = _.extend( action_data, action );
		if ( ! full_action.modified ) {
			full_action.modified = modified || new Date();
		}

		all_actions.push(full_action);
		full_actions.push(full_action);
	}

	return full_actions;
}

function getAllActions() {
	console.log(JSON.stringify(all_actions));
	return all_actions;
}

function getPlayerBoard() {
	var characterids = _.pluck(getCharcters(), '_id');
	var board = [];
	_.each( characterids, function( characterid ) {
		board.push({
			_id: characterid,
			up: true
		});
	});

	return board;
};

function getGame() {
	var board = getPlayerBoard();
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
			character: board[1]._id
		})
		.turn(token1)
		.toDbObject();

	var actions = createActions(gameid2, token3, [
		random_questions[0],
		random_questions[0]
	]);
	var user3actions = _.pluck(actions, '_id');

	actions = createActions(gameid2, token2, [
		random_questions[0]
	]);
	var user2actions = _.pluck(actions, '_id');

	var otherGame = new Game(gameid2)
		.board(boardid)
		.addPlayer({
			id: token3,
			board: board,
			character: board[0]._id,
			actions: user3actions
		})
		.addPlayer({
			id: token2,
			board: board,
			character: board[1]._id,
			actions: user2actions
		})
		.turn(token2)
		.toDbObject();
	return [game, otherGame];
};

exports.execute = function( callback ) {
	new DbBuilder()
		.addUsers(getUsers())
		.addCharacters(getCharcters())
		.addGames(getGame())
		.addBoards(getBoards())
		.addActions(getAllActions())
		.build(function() {
			console.log('Database Initialization of Fake data complete');
			callback();
		});
}