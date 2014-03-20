var connection = require('./database');
var BSON = require('mongodb').BSONPure;
var util = require('./util');
var DbBuilder = require('./dbutil').DbBuilder;

var _ = require('underscore');

function getUsers() {
	return [
		{ username:'gezzoo_0', _id:util.toObjectId('52728ca9954deb0b31000004'), role: ['admin'] },
	];
};

function getCharcters() {
	return [
		{name:'Shah Rukh Khan', category:['bollywood'], img:'/images/bollywood/MV5BMTQxMjg4Mzk1Nl5BMl5BanBnXkFtZTcwMzQyMTUxNw@@._V1_SY317_CR1,0,214,317_.jpg'},
		{name:'Arjun Rampal', category:['bollywood'], img:'/images/bollywood/MV5BMTg0NTAzOTU4Ml5BMl5BanBnXkFtZTcwMzg1MjUyOA@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Anupam Kher', category:['bollywood'], img:'/images/bollywood/MV5BMTY0MDkxMzkwN15BMl5BanBnXkFtZTcwODUxNTA5Nw@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Sanjay Dutt', category:['bollywood'], img:'/images/bollywood/MV5BNzU2NTgwNzY1OF5BMl5BanBnXkFtZTcwMjQxNzcxOA@@._V1_SY317_CR131,0,214,317_.jpg'},
		{name:'Hrithik Roshan', category:['bollywood'], img:'/images/bollywood/MV5BMTU1MjQzNDExN15BMl5BanBnXkFtZTcwNzIxMTg0Mw@@._V1_SY317_CR173,0,214,317_.jpg'},
		{name:'Akshay Kumar', category:['bollywood'], img:'/images/bollywood/MV5BMTU4NzM4Nzk1OF5BMl5BanBnXkFtZTcwMTAwMTA1NA@@._V1_SY317_CR104,0,214,317_.jpg'},
		{name:'Salman Khan', category:['bollywood'], img:'/images/bollywood/MV5BMTIyODQyOTA1M15BMl5BanBnXkFtZTcwMDQxNDIzMQ@@._V1_SY317_CR56,0,214,317_.jpg'},
		{name:'Ranveer Singh', category:['bollywood'], img:'/images/bollywood/MV5BMTExOTcwMDU4NTReQTJeQWpwZ15BbWU3MDA0MjE1MTc@._V1_SY317_CR1,0,214,317_.jpg'},
		{name:'Emraan Hashmi', category:['bollywood'], img:'/images/bollywood/MV5BMjExNzExNDY3OV5BMl5BanBnXkFtZTcwNzAyMTg2OA@@._V1_SY317_CR0,0,214,317_.jpg'},
		{name:'Amitabh Bachchan', category:['bollywood'], img:'/images/bollywood/MV5BNTk1OTUxMzIzMV5BMl5BanBnXkFtZTcwMzMxMjI0Nw@@._V1_SY317_CR8,0,214,317_.jpg'},
		{name:'Abhishek Bachchan', category:['bollywood'], img:'/images/bollywood/MV5BMTk1NjU1NjkxN15BMl5BanBnXkFtZTcwNDI4MDMzMg@@._V1_SY317_CR10,0,214,317_.jpg'},
		{name:'John Abraham', category:['bollywood'], img:'/images/bollywood/MV5BMTY1MDUyMjI1N15BMl5BanBnXkFtZTYwMjg4MjA0._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Deepika Padukone', category:['bollywood'], img:'/images/bollywood/MV5BMjAxMTAwMTY2MV5BMl5BanBnXkFtZTcwOTM5NTQyMg@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Katrina Kaif', category:['bollywood'], img:'/images/bollywood/MV5BMTUwODY3NzA3NF5BMl5BanBnXkFtZTcwNTEzNDg3OA@@._V1_SY317_CR6,0,214,317_.jpg'},		
		{name:'Anushka Sharma', category:['bollywood'], img:'/images/bollywood/MV5BMTc0NDMzMDYyM15BMl5BanBnXkFtZTcwMDEwMTA1NA@@._V1_SY317_CR104,0,214,317_.jpg'},
		{name:'Priyanka Chopra', category:['bollywood'], img:'/images/bollywood/MV5BMjAxNzUwNjExOV5BMl5BanBnXkFtZTcwNDUyMTUxNw@@._V1_SY317_CR105,0,214,317_.jpg'},
		{name:'Aishwarya Rai', category:['bollywood'], img:'/images/bollywood/MV5BMjEyMjEyODkzN15BMl5BanBnXkFtZTcwODkxMTY1Mg@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Sonakshi Sinha', category:['bollywood'], img:'/images/bollywood/MV5BOTg3MzQxMTkwOF5BMl5BanBnXkFtZTcwNjcyOTM5NA@@._V1_SY317_CR18,0,214,317_.jpg'},
		{name:'Vidya Balan', category:['bollywood'], img:'/images/bollywood/MV5BNDI3Mjk2MjgzMl5BMl5BanBnXkFtZTcwODQwMjI1OQ@@._V1_SY317_CR3,0,214,317_.jpg'},
		{name:'Rani Mukerji', category:['bollywood'], img:'/images/bollywood/MV5BMTg0MTI5MDkyMV5BMl5BanBnXkFtZTcwNzIyMDQ4Mg@@._V1_SY317_CR111,0,214,317_.jpg'},
		{name:'Preity Zinta', category:['bollywood'], img:'/images/bollywood/MV5BMTQyMDc4NTE1Ml5BMl5BanBnXkFtZTcwOTQwMDgxOA@@._V1_SX214_CR0,0,214,317_.jpg'},
		{name:'Kajol', category:['bollywood'], img:'/images/bollywood/MV5BNzIyNDI1MTYwMV5BMl5BanBnXkFtZTcwNzg5MzcxMw@@._V1_SY317_CR131,0,214,317_.jpg'},
		{name:'Madhuri Dixit', category:['bollywood'], img:'/images/bollywood/MV5BMjI1MTMxMDMxMV5BMl5BanBnXkFtZTcwMTUzNzY3Nw@@._V1_SY317_CR18,0,214,317_.jpg'},
		{name:'Juhi Chawla', category:['bollywood'], img:'/images/bollywood/MV5BNzI1MzUxODczNV5BMl5BanBnXkFtZTcwNDUyNTA0MQ@@._V1_SY317_CR12,0,214,317_.jpg'}
	];
};

function initV1( callback ) {
	new DbBuilder()
			.addUsers(getUsers())
			.addCharacters(getCharcters())
			.setCategory('bollywood')
			.build(function() {
				console.log('Database Initilization Complete');
				callback();
			});
}

exports.execute = function( callback ) {
	connection.getInstance(function(db) {
		var versiondb = db.version();
		versiondb.findOne(function(err, version) {
			if (err) throw err;
			if ( version === null ) {
				initV1(function() {
					versiondb.insert({'version':1.0}, function(err,version) {
						console.log('migration finished');
						db.close();
						callback();
					});
				});
			} else {
				callback();
			}

			// } else if ( version.version == 1.0 ) {
		});
	});

};