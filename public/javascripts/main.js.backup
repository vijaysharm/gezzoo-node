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

	var View = function( user, game ) {
		this.user = user;
		this.game = game;

		this.flip = function( e ) {
			var character = $(e.target).closest('.character');
			var characterid = character.data('character');

			character.toggleClass('up');
			character.toggleClass('down');

			log('flip: ' + characterid);
		};

		this.guess = function( e ) {
			var characterid = $(e.target).closest('.character').data('character');
			var board = [];
			var x = $('.character').each(function() {
				var $this = $(this);
				board.push({
					_id: $this.data('character'),
					up: $this.hasClass('up')
				});
			});
			log('guess: ' + characterid);
		};

		this.user_actions = function(game) {
			var actions = game.me.actions;
			var items = '';
			var question = loadTemplateById('#user_question_item');
			var answer = loadTemplateById('#user_answer_item');
			var ask = loadTemplateById('#ask_question_item');

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
		};

		/**
		 * TODO: I need to show the 'last' question at the top
		 * TODO: I should remap the board into a map so look ups
		 *		 are faster
		 */
		this.characters = function( game ) {
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
					up: character.up ? 'up' : 'down'
				};

				items += character_template(obj);
			}

			return items;
		};

		this.show_board = function() {
			log('show board');
			$('.characters').show();
			$('.actions').hide();
		};

		this.show_actions = function() {
			log('show actions');
			$('.actions').show();
			$('.characters').hide();
		};

		var me = this;
		return {
			events: [{
				trigger: 'click',
				id: '.flip-button',
				callback: me.flip
			}, {
				trigger: 'click',
				id: '.guess-button',
				callback: me.guess
			}, {
				trigger: 'click',
				id: '.board-button',
				callback: me.show_board
			}, {
				trigger: 'click',
				id: '.question-button',
				callback: me.show_actions
			}],

			template_helpers: [{
				name: 'characters',
				callback: me.characters
			}, {
				name: 'user_actions',
				callback: me.user_actions
			}],

			render: function() {
				return loadTemplateById('#user_turn')(me.game);
			}
		};
	};

	/**
	 * View switch core logic.
	 *
	 * TODO: Allow for helpers or events to be detached.
	 * TODO: Let the view know when its been attached so it
	 * 		 can cache DOM elements.
	 * TODO: Provide a way for the view to indicate that 
	 *		 It needs to transition to another view.
	 */
	function switchToView( view ) {
		for ( t in view.template_helpers ) {
			var helper = view.template_helpers[t];
			Handlebars.registerHelper( helper.name, helper.callback );
		}

		$main.html( view.render() );

		for ( e in view.events ) {
			var ev = view.events[e];
			$main.on( ev.trigger, ev.id, ev.callback );
		}
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
				switchToView( new View( user, game ) );
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

			var itemClick = function(e) {
				var gameid = $(e.target).closest('.block').data('game');
				if ( gameid ) {
					showGame( user, gameid );
					$main.off('click', 'div.block', itemClick );
				}
			};

			$main.on('click', 'div.block', itemClick );
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