/**
 * This class is meant as the business logic center of 
 */

/**
 * @param game is the game object from the db
 * @param user is the user object from the users db
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
		console.log('Valid game!');
	} else {
		return 'Invalid game object';	
	}

	return null;
};