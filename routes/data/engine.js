var _ = require('underscore');
/**
 * This class is meant as the business logic center of 
 * Gezzoo. Don't be stingy with your checking. Imagine the
 * flow of the game, and make sure that you check every state
 * of the game object in order to verify that the api call 
 * can be made.
 */

function checkUser( user, res, callback ) {
	if ( user ) {
		callback();
	} else {
		res.json( 401, 'Invalid user object' );
	}
};

function checkCharacter( character, res, callback ) {
	if ( character ) {
		callback();
	} else {
		res.json( 401, 'Invalid character object' );
	}
};

function checkGame( game, user, res, callback ) {
	if ( game ) {
		callback();
	} else {
		res.json( 401, 'Invalid game object' );
	}
};

function checkIsCharacterSet( game, user, expected, res, callback ) {
	// Check if the game object has any set characters
	// and check if that player has a character set.
	var c = _.find(game.selected_characters, function(p) {
		return user._id.equals(p.player);
	});

	if ( c ) {
		if ( expected ) {
			callback();
		} else {
			res.json( 401, 'Character already set' );	
		}
	} else {
		if ( expected ) {
			res.json( 401, 'Character not set' );	
		} else {
			callback();
		}
	}
};

function checkTurn( game, user, res, callback ) {
	var turn = user._id.equals(game.turn);
	if ( turn === false ) {
		res.json( 401, 'Not your turn' );
	} else {
		callback();
	}
}

exports.verifyAction = function( req, res, next ) {
	var user = req.user;
	var game = req.game;
	var action = req.action;
	var value = req.value;
	var result = null;
	var board = req.board;
	var player_board = req.player_board;
	var character = req.character;

	if ( action === 'question' || action === 'reply' || action === 'guess' ) {

	} else {
		result = 'Invalid action [' + action + ']';
	}

	if ( ! user ) {
		result = 'Invalid user object';
	}

	if ( player_board && action === 'guess' ) {
		result = "Can't update board and guess your character";
	}

	if ( player_board || board ) {
		if ( player_board.length !== board.characters.length ) {
			result = 'Invalid player board length';
		}
	} else {
		result = 'Invalid player board';
	}

	if ( game ) {
		var turn = user._id.equals(game.turn);
		if ( turn === false ) {
			result = 'Not your turn';
		}
	} else {
		result = 'Invalid game object';
	}

	if ( result ) {
		res.json(401, result);
	} else {
		next();	
	}
};

exports.verifyQuestion = function( req, res, next ) {
	var user = req.user;
	var game = req.game;
	var player_board = req.player_board;
	var board = res.board;
};

exports.verifyUpdateBoard = function( req, res, next ) {
	var user = req.user;
	var game = req.game;
	var board = req.board;
	var player_board = req.player_board;
	var result = null;

	if ( ! user ) {
		result = 'Invalid user object';
	}

	if ( ! board ) {
		result = 'Invalid board';
	}

	if ( player_board ) {
		if ( player_board.length !== board.characters.length ) {
			result = 'Invalid player board length';
		}
	} else {
		result = 'Invalid player board';
	}

	if ( game ) {
		var turn = user._id.equals(game.turn);
		if ( turn === false ) {
			result = 'Not your turn';
		}
	} else {
		result = 'Invalid game object';
	}

	if ( result ) {
		res.json(401, result);
	} else {
		next();	
	}
};

exports.verifySetCharacter = function( req, res, next ) {
	var user = req.user;
	var character = req.character;
	var game = req.game;
	checkUser( user, res, function() {
		checkGame( game, user, res, function() {
			checkTurn( game, user, res, function() {
				checkCharacter( character, res, function() {
					checkIsCharacterSet( game, user, false, res, function() {
						next();
					});
				});
			});
		});
	});
};

exports.verifyGuess = function( req, res, next ){
	var user = req.user;
	var character = req.character;
	var game = req.game;
	var opponent = req.opponent;
	checkUser( user, res, function() {
		checkGame( game, user, res, function() {
			checkTurn( game, user, res, function() {
				checkCharacter( character, res, function() {
					checkIsCharacterSet( game, user, true, res, function() {
						checkIsCharacterSet( game, opponent, true, res, function() {
							next();
						});
					});
				});
			});
		});
	});
};
