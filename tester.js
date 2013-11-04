var http = require('http');
var querystring = require('querystring');
var _ = require('underscore');
var tokenid = '52728ca9954deb0b31000004';

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

newGamePost(tokenid, function( data ) {
	data = JSON.parse( data );
	var characters = data.board.characters;
	var gameid = data._id;
	console.log(data.board._id);
	setCharacterPost(gameid, characters[0], tokenid, function(data) {
		console.log(data);
	});
});