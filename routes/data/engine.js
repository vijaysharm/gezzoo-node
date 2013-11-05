var _ = require('underscore');
/**
 * This class is meant as the business logic center of 
 * Gezzoo. Don't be stingy with your checking. Imagine the
 * flow of the game, and make sure that you check every state
 * of the game object in order to verify that the api call 
 * can be made.
 */

/**
 * @param game is the game object from the db
 * @param user is the user object from the users db
 * @param character is the character object from the db
 */
exports.verifySetCharacter = function( user, game, character ) {
	if ( user ) {

	} else {
		return 'Invalid user object';
	}

	if ( character ) {

	} else {
		return 'Invalid character object';
	}

	if ( game ) {
		// Check if the game object has any set characters
		// and check if that player has a character set.
		var c = _.find(game.selected_characters, function(p) {
			return user._id.equals(p.player);
		});
		if ( c ) {
			return 'Character already set';
		}

		var turn = user._id.equals(game.turn);
		if ( turn === false ) {
			return 'Not your turn';
		}
	} else {
		return 'Invalid game object';	
	}

	return null;
};

exports.verifyAskQuestion = function( user, game, action, value ) {
	if ( user ) {

	} else {
		return 'Invalid user object';
	}

	if ( game ) {
		var turn = user._id.equals(game.turn);
		if ( turn === false ) {
			return 'Not your turn';
		}
	} else {
		return 'Invalid game object';
	}

	return null;
};