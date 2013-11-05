var http = require('http');
var querystring = require('querystring');
var _ = require('underscore');
var tokenid_player_1 = '52728ca9954deb0b31000004';
var tokenid_player_2;

function extractOpponent(current, players) {
	return _.find( players, function(player) {
		return player !== current;
	});
};

var post = function( data, url, callback ) {
	var options = {
	  host: 'localhost',
	  port: 3000,
	  path: url,
	  method: 'POST',
	  headers: {
	        'Content-Type': 'application/x-www-form-urlencoded',
	        'Content-Length': Buffer.byteLength(data)
	  }
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			callback(chunk);
		});
	});

	req.write(data);
	req.end();
};

var newGamePost = function( token, callback ) {
	var data = querystring.stringify({
		token:token
	});

	post(data,'/api/games',callback);
};

var setCharacterPost = function( gameid, characterid, token, callback ) {
	var data = querystring.stringify({
		token:token,
		character: characterid
	});

	var path = '/api/games/' + gameid + '/character'
	post(data, path, callback);
};

newGamePost(tokenid_player_1, function( data ) {
	data = JSON.parse( data );
	tokenid_player_2 = extractOpponent(tokenid_player_1, data.players);
	
	var gameid = data._id;
	var characters = data.board.characters;
	var characterid = characters[0]._id;
	console.log( 'Setting: ' + characters[0].name + ': id->' + characterid);
	setCharacterPost(gameid, characterid, tokenid_player_1, function(data) {
		console.log(data);
		setCharacterPost(gameid, characters[1]._id, tokenid_player_1, function(data) {
			console.log(data);
		});
	});
});