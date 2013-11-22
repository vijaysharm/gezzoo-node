var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
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
		return [
			{
				_id:util.toObjectId('5286e01d9beb41000000001c'),
				players:[
					util.toObjectId(token1),
					util.toObjectId(token2)
				],
				turn:util.toObjectId(token1),
				ended: false,
				board: util.toObjectId(boardid),
				actions: [
					{ player: util.toObjectId(token1), list: []},
				  	{ player: util.toObjectId(token2), list: []}
				],
				player_board:[ 
					{
						player: util.toObjectId(token1),
						board: [
							{_id: util.toObjectId(character_id[0]), up:true},
							{_id: util.toObjectId(character_id[1]), up:true},
							{_id: util.toObjectId(character_id[2]), up:true},
							{_id: util.toObjectId(character_id[3]), up:true}
						]
					},
					{
						player: util.toObjectId(token2),
						board: [
							{_id: util.toObjectId(character_id[0]), up:true},
							{_id: util.toObjectId(character_id[1]), up:true},
							{_id: util.toObjectId(character_id[2]), up:true},
							{_id: util.toObjectId(character_id[3]), up:true}
						]
					}					
				],
				selected_characters: [
				  { player: util.toObjectId(token1), character: util.toObjectId(character_id[0])},
				  { player: util.toObjectId(token2), character: util.toObjectId(character_id[1])}
				]
			}
		];
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

});