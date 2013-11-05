var connection = require('./database');
var BSON = require('mongodb').BSONPure;
var util = require('./util');

var _ = require('underscore');

var getUsers = function() {
	return [
		{ username:'gezzoo_0', _id:util.toObjectId('52728ca9954deb0b31000004') },
		{ username:'gezzoo_1', _id:util.toObjectId('52728fbf63a64c904c657ed5') },
		{ username:'gezzoo_2', _id:util.toObjectId('52728fbf63a64c904c657ed6') }
	];
};

var getCharcters = function() {
	return [
		{name:'Shah Rukh Khan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTQxMjg4Mzk1Nl5BMl5BanBnXkFtZTcwMzQyMTUxNw@@._V1_SY317_CR1,0,214,317_.jpg'},
		{name:'Arjun Rampal', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTg0NTAzOTU4Ml5BMl5BanBnXkFtZTcwMzg1MjUyOA@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Anupam Kher', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTY0MDkxMzkwN15BMl5BanBnXkFtZTcwODUxNTA5Nw@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Sanjay Dutt', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNzU2NTgwNzY1OF5BMl5BanBnXkFtZTcwMjQxNzcxOA@@._V1_SY317_CR131,0,214,317_.jpg'},
		{name:'Hrithik Roshan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTU1MjQzNDExN15BMl5BanBnXkFtZTcwNzIxMTg0Mw@@._V1_SY317_CR173,0,214,317_.jpg'},
		{name:'Akshay Kumar', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTU4NzM4Nzk1OF5BMl5BanBnXkFtZTcwMTAwMTA1NA@@._V1_SY317_CR104,0,214,317_.jpg'},
		{name:'Salman Khan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTIyODQyOTA1M15BMl5BanBnXkFtZTcwMDQxNDIzMQ@@._V1_SY317_CR56,0,214,317_.jpg'},
		{name:'Ranveer Singh', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTExOTcwMDU4NTReQTJeQWpwZ15BbWU3MDA0MjE1MTc@._V1_SY317_CR1,0,214,317_.jpg'},
		{name:'Emraan Hashmi', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjExNzExNDY3OV5BMl5BanBnXkFtZTcwNzAyMTg2OA@@._V1_SY317_CR0,0,214,317_.jpg'},
		{name:'Amitabh Bachchan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNTk1OTUxMzIzMV5BMl5BanBnXkFtZTcwMzMxMjI0Nw@@._V1_SY317_CR8,0,214,317_.jpg'},
		{name:'Abhishek Bachchan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTk1NjU1NjkxN15BMl5BanBnXkFtZTcwNDI4MDMzMg@@._V1_SY317_CR10,0,214,317_.jpg'},
		{name:'John Abraham', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTY1MDUyMjI1N15BMl5BanBnXkFtZTYwMjg4MjA0._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Deepika Padukone', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjAxMTAwMTY2MV5BMl5BanBnXkFtZTcwOTM5NTQyMg@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Katrina Kaif', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTUwODY3NzA3NF5BMl5BanBnXkFtZTcwNTEzNDg3OA@@._V1_SY317_CR6,0,214,317_.jpg'},		
		{name:'Anushka Sharma', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTc0NDMzMDYyM15BMl5BanBnXkFtZTcwMDEwMTA1NA@@._V1_SY317_CR104,0,214,317_.jpg'},
		{name:'Priyanka Chopra', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjAxNzUwNjExOV5BMl5BanBnXkFtZTcwNDUyMTUxNw@@._V1_SY317_CR105,0,214,317_.jpg'},
		{name:'Aishwarya Rai', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjEyMjEyODkzN15BMl5BanBnXkFtZTcwODkxMTY1Mg@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Sonakshi Sinha', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BOTg3MzQxMTkwOF5BMl5BanBnXkFtZTcwNjcyOTM5NA@@._V1_SY317_CR18,0,214,317_.jpg'},
		{name:'Vidya Balan', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNDI3Mjk2MjgzMl5BMl5BanBnXkFtZTcwODQwMjI1OQ@@._V1_SY317_CR3,0,214,317_.jpg'},
		{name:'Rani Mukerji', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTg0MTI5MDkyMV5BMl5BanBnXkFtZTcwNzIyMDQ4Mg@@._V1_SY317_CR111,0,214,317_.jpg'},
		{name:'Preity Zinta', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMTQyMDc4NTE1Ml5BMl5BanBnXkFtZTcwOTQwMDgxOA@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Kajol', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNzIyNDI1MTYwMV5BMl5BanBnXkFtZTcwNzg5MzcxMw@@._V1_SY317_CR131,0,214,317_.jpg'},
		{name:'Madhuri Dixit', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BMjI1MTMxMDMxMV5BMl5BanBnXkFtZTcwMTUzNzY3Nw@@._V1_SY317_CR18,0,214,317_.jpg'},
		{name:'Juhi Chawla', category:['bollywood'], img:'http://ia.media-imdb.com/images/M/MV5BNzI1MzUxODczNV5BMl5BanBnXkFtZTcwNDUyNTA0MQ@@._V1_SY317_CR12,0,214,317_.jpg'}
	];
};

var initializeCounter = function( db, callback ) {
	var countersdb = db.counters();
	var users = getUsers();
	countersdb.drop();

	countersdb.insert({ _id:'userid', seq: users.length }, function(err, result) {
		if ( err ) throw err;
		callback();
	});
};

var insertUsers = function( db, callback ) {
	var usersdb = db.users();
	usersdb.drop();

	var users = getUsers();
	usersdb.insert( users, function( err, result ) {
		if ( err ) throw err;
		callback();
	});
};

var initializeGames = function( db, callback ) {
	var gamesdb = db.games();
	gamesdb.drop();
	callback();
};

var createBoard = function( name, characters ) {
	return {
		name: name,
		characters: characters
	};
};

var initializeBoards = function( db, callback ) {
	var boardsdb = db.boards();
	var charactersdb = db.characters();
	boardsdb.drop();

	var query = {category:{$all:[ 'bollywood' ]}};
	charactersdb.find(query).limit(24).toArray(function(err, characters) {
		if ( err ) throw err;
		var charids = _.pluck(characters,'_id');
		var board = createBoard('Bollywood', charids);
		boardsdb.insert(board, function(err, insertedboard) {
			if ( err ) throw err;
			callback();
		})
	});
};

var initializeCharacters = function( db, callback ) {
	var charactersdb = db.characters();
	charactersdb.drop();
	var characters = getCharcters();
	charactersdb.insert(characters, function(err, result) {
		if ( err ) throw err;
		callback();
	});
};

var initializeActions = function( db, callback ) {
	var actionsdb = db.actions();
	actionsdb.drop();
	callback();
};

exports.execute = function( callback ) {
	connection.getInstance(function( db ) {
		insertUsers( db, function() {
			initializeCounter( db, function() {
				initializeCharacters( db, function() {
					initializeBoards( db, function() {
						initializeGames( db, function() {
							console.log('Database Initilization Complete');
							db.close();
							callback();
						});
					});
				});
			});
		});
	});
};