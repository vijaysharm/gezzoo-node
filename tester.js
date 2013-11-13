var http = require('http');
var querystring = require('qs');
var _ = require('underscore');
var tokenid_player_1 = '52728ca9954deb0b31000004';
var tokenid_player_2;

function extractOpponent(current, players) {
	return _.find( players, function(player) {
		return player !== current;
	});
};

function post( data, url, callback ) {
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
			callback(JSON.parse(chunk));
		});
	});

	req.write(data);
	req.end();
};

function newGamePost( token, callback ) {
	var data = querystring.stringify({
		token:token
	});

	post(data,'/api/games',callback);
};

function setCharacterPost( gameid, characterid, token, callback ) {
	var data = querystring.stringify({
		token: token,
		character: characterid
	});

	var path = '/api/games/' + gameid + '/character';
	post(data, path, callback);
};

function postAction( gameid, action, value, token, callback ) {
	var data = querystring.stringify({
		action: action,
		value: value,
		token: token
	});

	var path = '/api/games/' + gameid + '/action';
	post(data, path, callback);
};

function updateBoard( gameid, player_board, token, callback ) {
	var data = querystring.stringify({
		player_board: player_board,
		token: token
	});

	var path = '/api/games/' + gameid + '/board';
	post(data, path, callback);	
};

function guess( gameid, characterid, token, callback ) {
	var data = querystring.stringify({
		character: characterid,
		token: token
	});

	var path = '/api/games/' + gameid + '/guess';
	post(data, path, callback);	
};

newGamePost(tokenid_player_1, function( data ) {
	tokenid_player_2 = extractOpponent(tokenid_player_1, data.players);

	var gameid = data._id;
	var characters = data.board.characters;
	var characterid = characters[0]._id;
	var player_1_board = data.player_board;
	console.log( 'Setting: ' + characters[0].name + ': id->' + characterid + ' for player 1');
	setCharacterPost(gameid, characterid, tokenid_player_1, function(data) {
		console.log(data);
		console.log( 'Setting: ' + characters[1].name + ': id->' + characterid + ' for player 2');
		setCharacterPost(gameid, characters[1]._id, tokenid_player_2, function(data) {
			console.log(data);

			postAction(gameid, 'question', 'Hiya!', tokenid_player_1, function(data) {
				console.log(data);
				updateBoard(gameid, player_1_board, tokenid_player_2, function(data) {
					// console.log(JSON.stringify(data));
					guess(gameid, characters[0]._id, tokenid_player_1, function(data) {
						console.log(data);
					});
				});
			});
		});
	});
});