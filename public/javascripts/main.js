(function() {
	function loadById(id) {
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

	function showGames( user ) {
		var $main = $('#main');
		var loading_el = loadById('#fullscreen-loading')();
		var game_list_template = loadById('#game-list');

		$main.html(loading_el);
		$.getJSON('/api/games', {token: user.token}, function(games) {
			log(games);
			$main.html(game_list_template({ game:games }));
		});
	};

	var token = {token:'52728fbf63a64c904c657ed5'};
	doPost('/api/login', token, function( user ) {
		var user = _.extend( user, token );
		log('logged in user ' + JSON.stringify(user));
		showGames( user );
	});
})();