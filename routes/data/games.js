var connection = require('../database');

var games = [
	{ id:1, player1:"vijay", player2:"slim", turn:"vijay" },
	{ id:2, player1:"slim", player2:"navika", turn:"slim" }
];

var game1 = {
	id : 1,
	round: 4,
	player1:'vijay', 
	player2:'slim',
	turn: 'vijay',
	board : [
		{ character: 'char1', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char2', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char3', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char4', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char5', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char6', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char7', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
		{ character: 'char8', image: 'http://ia.media-imdb.com/images/M/MV5BMzMxNDY1ODYwN15BMl5BanBnXkFtZTcwNzY3MzU4OQ@@._V1._SY314_CR13,0,214,314_.jpg', state:'up' },
	],
	messages : {
		player1 :
		[
			{ by: 'vijay', text: 'Is your person...', date: '12345' },
			{ by: 'slim', text: 'Is your person...', date: '12346' }
		],
		player2 :
		[
			{ by: 'vijay', text: 'Is your person...', date: '12345' },
			{ by: 'slim', text: 'Is your person...', date: '12346' }
		]
	}
};

exports.findGames = function( username ) {
	var result = [];
	for ( game in games ) {
		if ( games[game].player1 === username || games[game].player2 === username ) {
			result.push( games[game] );
		}
	}

	return result;
}

exports.findGame = function( username, gameId ) {
	for ( game in games ) {
		var test = games[game];
		if ( ( test.player1 === username || test.player2 === username ) && 
			 ( test.id === gameId ) ) {
			return games[game];
		}
	}

	return null;
}

