var _ = require('underscore');
var util = require('../util');
var isBlank = util.isBlank;
var toObjectId = util.toObjectId;
var gameutil = require('../game.util');

/**
 * This class is meant as the business logic center of 
 * Gezzoo. Don't be stingy with your checking. Imagine the
 * flow of the game, and make sure that you check every state
 * of the game object in order to verify that the api call 
 * can be made.
 */

function validateCharacterExistence( game, user, expected, res, callback ) {
	// Check if the game object has any set characters
	// and check if that player has a character set.
	var player = _.find(game.players, function(p) {
		return user._id.equals(p.id);
	});

	if ( player.character ) {
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

/**
 * Go through the player's board and compare it 
 * against the known board  in the game.
 */
function validatePlayerBoard( board, player_board ) {
	if ( board.length === player_board.length ) {
		var copy = board.slice(0);
		var isValid = true;
		_.each(player_board, function(character) {
			var id = toObjectId(character._id);
			for ( var i = 0; i < copy.length; i++ ) {
				var c = copy[i];
				if ( id.equals(c._id) ) {
					copy.splice(i, 1);
					break;
				}
			}
		});
		return copy.length === 0;
	} else {
		return false;
	}
};

function validateQuestionID( questionid, opponent_actions, res, callback ) {
	var action = _.find( opponent_actions, function( action ) {
		return questionid.equals( action._id );
	});

	if ( action ) {
		if ( action.action === 'question' ) {
			if ( action.reply ) {
				res.json(401,'Cannot post reply to question which already has a reply');
			} else {
				callback();
			}
		} else {
			res.json(401, 'Replies can only be sent to question types');
		}
	} else {
		res.json(401, 'Invalid question ID provided: ' + questionid);
	}
};

function checkPlayerBoard( req, res, callback ) {
	var player_board = req.player_board;
	var board = req.board;
	if ( player_board ) {
		if ( board ) {
			var isValid = validatePlayerBoard( board.characters, player_board );
			if ( isValid ) {
				callback();
			} else {
				res.json(401, 'Player board is not valid.');
			}
		} else {
			res.json(401, "Can't validate player board without a game board.");
		}
	} else {
		callback();
	}
};

function checkUser( req, res, callback ) {
	var user = req.user;
	if ( user ) {
		callback();
	} else {
		res.json( 401, 'Invalid user object' );
	}
};

function checkCharacter( req, res, callback ) {
	var character = req.character;
	if ( character ) {
		callback();
	} else {
		res.json( 401, 'Invalid character object' );
	}
};

function checkGame( req, res, callback ) {
	var game = req.game;
	if ( game ) {
		if ( game.ended ) {
			res.json(401, 'Game has ended. Cannot be modified');
		} else {
			callback();
		}
	} else {
		res.json( 401, 'Invalid game object' );
	}
};

function checkIsCharacterSet( req, res, callback ) {
	var game = req.game;
	var user = req.user;

	validateCharacterExistence( game, user, true, res, callback );
};

function checkIsCharacterUnset( req, res, callback ) {
	var game = req.game;
	var user = req.user;

	validateCharacterExistence( game, user, false, res, callback );
};

function checkIsOpponentCharacterUnset( req, res, callback ) {
	var game = req.game;
	var opponent = req.opponent;

	if ( opponent ) {
		validateCharacterExistence( game, opponent, false, res, callback );
	} else {
		res.json(401, 'Invalid opponent user');
	}
};

function checkIsOpponentCharacterSet( req, res, callback ) {
	var game = req.game;
	var opponent = req.opponent;

	if ( opponent ) {
		validateCharacterExistence( game, opponent, true, res, callback );
	} else {
		res.json(401, 'Invalid opponent user');
	}
};

function checkTurn( req, res, callback ) {
	var game = req.game;
	var user = req.user;
	var turn = user._id.equals(game.turn);

	if ( turn === false ) {
		res.json( 401, 'Not your turn' );
	} else {
		callback();
	}
};

function checkQuestion( req, res, callback ) {
	var question = req.question;

	if ( isBlank( question ) ) {
		res.json(401, 'No question provided');
	} else {
		callback();
	}
};

function checkReply( req, res, callback ) {
	var reply = req.reply;
	var questionid = req.questionid;
	var opponent_actions = req.opponent_actions;

	if ( isBlank( reply ) ) {
		res.json(401, 'No reply provided');
	} else {
		if ( questionid ) {
			if ( opponent_actions ) {
				validateQuestionID( questionid, opponent_actions, res, callback );
			} else {
				res.json(401, 'List of opponent actions not available. Cannot save reply');
			}
		} else {
			res.json(401, 'Invalid question ID provided');
		}
	}
};

exports.verifyGetGames = function( req, res, next ) {
	checkUser( req, res, function() {
		next();
	});
};

exports.verifyGameById = function( req, res, next ) {
	checkUser( req, res, function() {
		next();
	});
};

exports.verifyCreateNewGame = function( req, res, next ) {
	checkUser( req, res, function() {
		next();
	});
};

exports.verifySetCharacter = function( req, res, next ) {
	checkUser( req, res, function() {
		checkGame( req, res, function() {
			checkTurn( req, res, function() {
				checkCharacter( req, res, function() {
					checkIsCharacterUnset( req, res, function() {
						next();
					});
				});
			});
		});
	});
};

/**
 * TODO: Remove requirement that the opponent character is set
 */
exports.verifyAskQuestion = function( req, res, next ) {
	checkUser( req, res, function() {
		checkGame( req, res, function() {
			checkTurn( req, res, function() {
				checkIsCharacterSet( req, res, function() {
					checkIsOpponentCharacterSet( req, res, function() {
						checkQuestion( req, res, function() {
							checkPlayerBoard( req, res, function() {
								next();
							});
						});
					});
				});
			});
		});
	});
};

exports.verifyPostReply = function( req, res, next ) {
	checkUser( req, res, function() {
		checkGame( req, res, function() {
			checkTurn( req, res, function() {
				checkIsCharacterSet( req, res, function() {
					checkIsOpponentCharacterSet( req, res, function() {
						checkReply( req, res, function() {
							next();
						});
					});
				});
			});
		});
	});
};

exports.verifyGuess = function( req, res, next ){
	checkUser( req, res, function() {
		checkGame( req, res, function() {
			checkTurn( req, res, function() {
				checkCharacter( req, res, function() {
					checkIsCharacterSet( req, res, function() {
						checkIsOpponentCharacterSet( req, res, function() {
							checkPlayerBoard( req, res, function() {
								next();
							});
						});
					});
				});
			});
		});
	});
};
