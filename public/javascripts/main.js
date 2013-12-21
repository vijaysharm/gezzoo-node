(function() {
	function loadTemplateById(id) {
		return Handlebars.compile($(id).html());
	};

	function log(message) {
		console.log(message);
	};

	function doAjax(options) {
		$.ajax(options);
	};

	function doPost(url, data, callback) {
		doAjax({
			url: url,
			type: 'POST',
			dataType: 'json',
			success: callback,
			data: data,
			cache: false
		});
	};

	function findCharacterInBoard( id, board ) {
		for ( var index = 0; index < board.length; index++ ) {
			var person = board[index];
			if ( id === person._id ) {
				return person;
			}
		}

		return undefined;
	};

	Handlebars.registerHelper('log', function(obj) {
		log(JSON.stringify(obj));
	});

	Handlebars.registerHelper('turn_class', function() {
		var turn = this.turn === this.me._id;
		return turn ? 'my-turn' : 'their-turn';
	});

	Handlebars.registerHelper('turn_print', function() {
		var turn = this.turn === this.me._id;
		return turn ? "It's your turn" : "It's their turn";
	});

	Handlebars.registerHelper('game_date', function() {
		return moment(this.modified).fromNow();
	});

	/**
	 * TODO: I need to show the 'last' question at the top
	 * TODO: I should remap the board into a map so look ups
	 *		 are faster
	 */
	Handlebars.registerHelper('characters', function(game) {
		var board = game.me.board;
		var items = '';
		var character_template = loadTemplateById('#player_board_item');

		for ( var id = 0; id < board.length; id++ ) {
			var character = board[id];
			var person = findCharacterInBoard( character._id, game.board.characters );
			var obj = {
				id: character._id,
				img: person.img,
				name: person.name,
				up: character.up
			};

			items += character_template(obj);
		}

		return items;
	});

	Handlebars.registerHelper('user_actions', function(game) {
		var actions = game.me.actions;
		var items = '';
		var question = loadTemplateById('#user_question_type');
		var answer = loadTemplateById('#user_answer_type');
		var ask = loadTemplateById('#ask_question_type');

		// TODO: You can have a NPE in the obj here for the
		//		 reply value. This will need to be refactored
		//		 and made generic for the other use cases.
		for ( var id = 0; id < actions.length; id++ ) {
			var action = actions[id];
			if ( action.action === 'question' ) {
				var obj = {
					question: {
						value: action.value,
						by: game.me.username
					},
					reply: {
						value: action.reply.value, // TODO: NPE warning
						by: game.opponent.username
					}
				};
				items += question(obj);
			} else if ( action.action === 'guess' ) {
				var obj = {

				};
				items += answer(obj);
			} else {
				// ?? whatever, skip it.
			}
		}

		// TODO: What if the opponent has guessed right?
		//		 You should probably not display this.
		items += ask();

		return items;
	});

	var $main = $('#main');
	var loading_el = loadTemplateById('#fullscreen-loading')();

	function showReadOnly( game ) {
		log('read only game');
	};

	function showGiveReply( user, game ) {
		log('You need to see the opponent actions');
	};

	function showPickCharacter( user, game ) {
		log('pick a character');
	};

	function showAskAQuestion( user, game ) {
		// log('Ask as question');

		var askQuestionTemplate = loadTemplateById('#user_turn');
		$main.html(askQuestionTemplate(game));
	};

	function showSomethingWentWrong() {
		log('Unknown state: ' + game.state);
	};

	function showGame( user, gameid ) {
		$main.html(loading_el);
		var url = '/api/games/' + gameid;
		$.getJSON(url, {token: user.token}, function(game) {
			log(game);
			if ( 'read-only' === game.state ) {
				showReadOnly( game );
			} else if ( 'pick-character' === game.state ) {
				showPickCharacter( user, game );
			} else if ( 'ask-question' === game.state ) {
				showAskAQuestion( user, game );
			} else if ( 'give-reply' === game.state ) {
				showGiveReply( user, game );
			} else {
				showSomethingWentWrong();
			}
		});
	};

	/**
	 * TODO: Should clean up listener
	 */
	function showGames( user ) {
		var game_list_template = loadTemplateById('#game-list');
		$main.html(loading_el);
		$.getJSON('/api/games', {token: user.token}, function(games) {
			log(games);
			$main.html(game_list_template({ game:games }));
			$main.on('click div.block', function(e) {
				var gameid = $(e.target).closest('.block').data('game');
				if ( gameid ) showGame( user, gameid );
			});
		});
	};

	var token1 = '52728ca9954deb0b31000004';
	var token2 = '52728fbf63a64c904c657ed5';
	var token3 = '52728fbf63a64c904c657ea6';

	var token = {token:token2};
	doPost('/api/login', token, function( user ) {
		var user = _.extend( user, token );
		log('logged in user ' + JSON.stringify(user));
		showGames( user );
	});
})();