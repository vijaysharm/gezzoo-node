require.config({shim: {'ember': {deps: ['jquery','handlebars'], exports:'Ember'}}, baseUrl: '/javascripts'});
require(['ember'], function( Ember ) {
	App = Ember.Application.create({
	  // Basic logging, e.g. "Transitioned into 'post'"
	  LOG_TRANSITIONS: true,
	  LOG_VIEW_LOOKUPS: true,

	  // Extremely detailed logging, highlighting every internal
	  // step made while transitioning into a route, including
	  // `beforeModel`, `model`, and `afterModel` hooks, and
	  // information about redirects and aborted transitions
	  LOG_TRANSITIONS_INTERNAL: true
	});
	App.Router.map(function() {
		this.route('login');
		this.route('games');
		this.route('theirturn');
		this.resource('myturn', function() {
			this.route('pick');
			this.route('answer');
			this.resource('ask', function() {
				this.route('question');
				this.route('guess');
			});
		});
	});

	App.LoginController = Ember.Controller.extend({
		token: '52728ca9954deb0b31000004',
		username: 'gezzoo_0',
		actions: {
			login: function() {
				var data = this.getProperties('username');
				Ember.$.post('/login', data).then(function(response) {
					console.log(response);
				});
			}
		}
	});

	App.GamesController = Ember.Controller.extend({
		needs: ['login'],
		actions: {
			newgame: function() {
				var token = this.get('controllers.login').get('token');
				var data = {
					token: token
				};

				Ember.$.post('/api/games', data).then(function(response) {
					console.log(response);
				});	
			}
		}
	});
});