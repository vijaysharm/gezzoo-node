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

	Handlebars.registerHelper('turn_class', function() {
		var turn = this.turn === this.me._id;
		return turn ? 'my-turn' : 'their-turn';
	});

	Handlebars.registerHelper('turn_print', function() {
		var turn = this.turn === this.me._id;
		return turn ? "It's your turn" : "It's their turn";
	});

	Handlebars.registerHelper('game_date', function() {
		return '12hrs';
	});

	var $main = $('#main');
	var loading_el = loadTemplateById('#fullscreen-loading')();

	function showGame( user, gameid ) {
		$main.html(loading_el);
		var url = '/api/games/' + gameid;
		$.getJSON(url, {token: user.token}, function(game) {
			log(game);
			if ( 'opponent-reply' === game.state ) {
				// show read-only game
				log('read only game');
			} else if ( 'opponent-set-character' === game.state ) {
				// show read-only game
				log('read only game 2');
			} else if ( 'user-set-character' === game.state ) {
				log('You need a character');
			} else if ( 'user-reply' === game.state ) {
				// go to the page where you show the list of
				// user actions
				log('You need to see the opponent actions');
			}
		});
	};

	function showGames( user ) {
		var game_list_template = loadTemplateById('#game-list');
		$main.html(loading_el);
		$.getJSON('/api/games', {token: user.token}, function(games) {
			log(games);
			$main.html(game_list_template({ game:games }));
			$main.on('click div.block', function(e) {
				var gameid = $(e.target).data('game');
				showGame( user, gameid );
			});
		});
	};

	var token = {token:'52728fbf63a64c904c657ed5'};
	doPost('/api/login', token, function( user ) {
		var user = _.extend( user, token );
		log('logged in user ' + JSON.stringify(user));
		showGames( user );
	});
})();