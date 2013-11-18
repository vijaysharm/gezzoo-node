var assert = require('assert');
var request = require('supertest');
var should = require('should'); 
var util = require('../routes/util');
var DbBuilder = require('../routes/dbutil').DbBuilder;
var testutil = require('./util.test');

describe('Set Character', function() {
	var url = {
		domain: 'http://localhost:3000',
		subdomain: '/api/games/5286e01d9beb41000000001c/character'
	};
	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';

	function getUsers() {
		return [
			{ username:'gezzoo_0', _id:util.toObjectId(token1) },
			{ username:'gezzoo_1', _id:util.toObjectId(token2) }
		];
	};

	function getBoards() {
		return [
			{
				_id : util.toObjectId("5286fd942200ab0000000002"),
				name : "test", 
				characters : [ 	
					util.toObjectId("5286e01d8b587b0000000001"),
					util.toObjectId("5286e01d8b587b0000000002"),
					util.toObjectId("5286e01d8b587b0000000003"),
					util.toObjectId("5286e01d8b587b0000000004")
				]
			}
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

	function getGame() {
		return [
			{
				players:[
					util.toObjectId('52728ca9954deb0b31000004'),
					util.toObjectId('52728fbf63a64c904c657ed5')
				],
				opponent:{
					username:'gezzoo_1',
					_id:util.toObjectId('52728fbf63a64c904c657ed5')
				},
				turn:util.toObjectId('52728ca9954deb0b31000004'),
				_id:util.toObjectId('5286e01d9beb41000000001c'),
				board:{
					name:'test',
					characters:[
						{name:'person 1', img:'1.jpg', _id:util.toObjectId('5286e01d8b587b0000000001')},
						{name:'person 2', img:'2.jpg', _id:util.toObjectId('5286e01d8b587b0000000002')},
						{name:'person 3', img:'3.jpg', _id:util.toObjectId('5286e01d8b587b0000000003')},
						{name:'person 4', img:'4.jpg', _id:util.toObjectId('5286e01d8b587b0000000004')}
					],
					'_id':'5286fd942200ab0000000002'
				},
				player_board:[
					{_id: util.toObjectId('5286e01d8b587b0000000001'), up:true},
					{_id: util.toObjectId('5286e01d8b587b0000000002'), up:true},
					{_id: util.toObjectId('5286e01d8b587b0000000003'), up:true},
					{_id: util.toObjectId('5286e01d8b587b0000000004'), up:true}
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
			console.log(res.body);
			res.status.should.equal(200);
			done();
		});
	});	
});