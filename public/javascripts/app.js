App = Ember.Application.create();

App.Router.map(function() {
	this.route('/');
	this.resource('game', { path:'/:id' }, function() {
		this.route('select');
		this.route('board');
		this.route('actions');
		this.route('reply');
	});
});

App.AuthenticatedRoute = Ember.Route.extend({
	beforeModel: function(transition) {
		var loginController = this.controllerFor('login');
		if (! loginController.get('user')) {
			return loginController.login();
		}
	},
	getJSONWithToken: function(url) {
    	var user = this.controllerFor('login').get('user');
    	var token = user.token;
    	return $.getJSON(url, { token: token });
  	},
});

App.AuthenticatedGameRoute = App.AuthenticatedRoute.extend({
	// TODO: Not sure why the id isn't in the params object?
	model: function(params, transition) {
		var gameid = transition.params.id;
		var url = '/api/games/' + gameid;
		return this.getJSONWithToken(url);
	}
});

App.LoginController = Ember.Controller.extend({
	login: function() {
		var self = this;
		var token = '52728fbf63a64c904c657ed5';
		var data = {token:token};
		return Ember.$.post('/api/login', data).then(function(response) {
			self.set('user', {
				id: response.id,
				name: response.name,
				token: response.token
			});
		}, function(err) {
			console.log('login fail:');
			console.log(JSON.stringify(err));
		});
	}
});

/** Application **/
// TODO: This can be removed. I'm hard coding
//		 a path to a game.
App.ApplicationRoute = Ember.Route.extend({
	model: function() {
		return '5286e01d9beb41000b00003a';
	}
});

App.ApplicationView = Ember.View.extend({
	classNames: ["l-fill-parent"]
});

/** Game List **/
App.IndexView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});

App.IndexRoute = App.AuthenticatedRoute.extend({
	model: function() {
		return this.getJSONWithToken('/api/games');
	}	
});

App.GameItemController = Ember.Controller.extend({
	actions: {
		select: function() {
			var state = this.get('model.state');
			var id = this.get('model._id');
			if ( 'user-action' === state ) {
				this.transitionToRoute('game.board', id);
			} else if ( 'user-reply' === state ) {
				this.transitionToRoute('game.reply', id);
			} else if ( 'user-select-action' === state ) {
				this.transitionToRoute('game.select', id);
			} else if ( 'read-only' === state ) {
				this.transitionToRoute('game.board', id);
			}
		}
	},

	date: function(key, value) {
		var game = this.get('model');
		return moment(game.modified).fromNow();
	}.property('model.modified'),

	turn: function(key, value) {
		var game = this.get('model');
		var turn = game.turn === game.me._id;
		return turn ? "It's your turn" : "It's their turn";
	}.property('model.turn'),

	username: function(key, value) {
		var game = this.get('model');
		return game.opponent.username;
	}.property('model.opponent.username')
});

/** Select Character **/
App.GameSelectRoute = App.AuthenticatedGameRoute.extend({});
App.GameSelectView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});
App.GameSelectController = Ember.Controller.extend({
	characters: function() {
		return this.get('model.board.characters');
	}.property('model.board.characters'),
});
App.CharacterItemController = Ember.Controller.extend({
	actions: {
		select: function() {
			console.log('select');
			console.log(this.get('model.name'));
			console.log(this.get('model._id'));
		},
		guess: function() {
			console.log('guess');
			console.log(this.get('model.name'));
			console.log(this.get('model._id'));
		},
		flip: function() {
			var up = this.get('model.up');
			this.set('model.up', !up);
		}
	},
	needs: ['gameSelect', 'gameBoard'],
	img: function() {
		var character = this.get('model');
		return character.img;
	}.property('model.img'),
	name: function() {
		var character = this.get('model');
		return character.name;
	}.property('model.name'),
	isUserSelection: function() {
		var state = this.get('controllers.gameSelect.model.state');
		return state === 'user-select-action';
	}.property('controllers.gameSelect.model.state'),
	isUserAction: function() {
		var state = this.get('controllers.gameBoard.model.state');
		return state === 'user-action';
	}.property('controllers.gameBoard.model.state'),
	up: function(key, value) {
	    if (value === undefined) {
	      return this.get('model.up');
	    } else {
	      model.set('up', value);
	      return value;
	    }
	}.property('model.up')
});

/** board **/
App.GameBoardRoute = App.AuthenticatedGameRoute.extend({});
App.GameBoardView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});
App.GameBoardController = Ember.Controller.extend({
	actions: {
		board: function() {
			var id = this.get('model._id')
			this.transitionToRoute('game.board', id);
		},
		question: function() {
			var id = this.get('model._id');
			this.transitionToRoute('game.actions', id);
		}
	},
	// TODO: This method needs to look at the modified 
	//		 time to know which is the most recent
	//		 Also, what if the last action was a guess?
	getLastAction: function() {
		var actions = this.get('model.me.actions');
		if ( actions && actions.length > 0 ) {
			return actions[0];
		}

		return null;
	},
	lastaction: function() {
		var action = this.getLastAction();
		var data = {};

		if ( action && action.action === 'question' ) {
			data.me = {
				avatar: 'http://placehold.it/64x64',
				value: action.value
			};

			if ( action.reply ) {
				data.opponent = {
					name: this.get('model.opponent.username'),
					avatar: 'http://placehold.it/64x64',
					value: action.reply.value
				};
			}
		}

		return data;
	}.property('model.me.actions'),
	board: function() {
		var board = this.get('model.me.board');
		var characters = this.get('model.board.characters');
		var a = board.concat( characters );
		var b = _.reduce(a, function(m, item) {
			m[item._id] = ( m[item._id] ? _.extend(m[item._id], item) : item );
			return m; 
		}, {});

		return _.values(b);
	}.property('model.me.board')
});

/** Actions **/
App.GameActionsRoute = App.AuthenticatedGameRoute.extend({});
App.GameActionsView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});
App.GameActionsController = Ember.Controller.extend({
	actions: {
		board: function() {
			var id = this.get('model._id')
			this.transitionToRoute('game.board', id);
		},
		question: function() {
			var id = this.get('model._id');
			this.transitionToRoute('game.actions', id);
		}
	},
	convert: function( action ) {
		var data = {};

		if ( action ) {
			if ( action.action === 'question' ) {
				data.me = {
					avatar: 'http://placehold.it/64x64',
					value: action.value,
					type: action.action
				};

				if ( action.reply ) {
					data.opponent = {
						name: this.get('model.opponent.username'),
						avatar: 'http://placehold.it/64x64',
						value: action.reply.value
					};
				}
			} else if ( action.action === 'guess' ) {
				// TODO: Add the guessed character and the outcome
				data.me	= {
					avatar: 'http://placehold.it/64x64',
					type: action.action,
				}
			}
		}

		return data;
	},
	allactions: function() {
		var results = [];
		var actions = this.get('model.me.actions');
		for ( var i = 0; i < actions.length; i++ ) {
			var action = actions[i];
			results.push(this.convert(action));
		}

		return results;
	}.property('model.me.actions'),
	isUserAction: function() {
		return this.get('model.state') === 'user-action';
	}.property('model.state')
});
App.ActionItemController = Ember.Controller.extend({
	isAction: function() {
		return (this.get('model.me.type') === 'question');
	}.property('model.me.type'),
	me: function() {
		return this.get('model.me');
	}.property('model.me'),
	opponent: function() {
		return this.get('model.opponent');
	}.property('model.opponent'),
});

/** Opponent Reply **/
App.GameReplyRoute = App.AuthenticatedGameRoute.extend({});
App.GameReplyView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});
App.GameReplyController = Ember.Controller.extend({
	convert: function( action ) {
		var data = {};

		if ( action ) {
			if ( action.action === 'question' ) {
				data.opponent = {
					name: this.get('model.opponent.username'),
					avatar: 'http://placehold.it/64x64',
					value: action.value,
					type: action.action
				};

				if ( action.reply ) {
					data.me = {
						avatar: 'http://placehold.it/64x64',
						value: action.reply.value,
					};
				}
			} else if ( action.action === 'guess' ) {
				// TODO: Add the guessed character and the outcome
				data.opponent = {
					name: this.get('model.opponent.username'),
					avatar: 'http://placehold.it/64x64',
					type: action.action,
				}
			}
		}

		return data;
	},
	allactions: function() {
		var results = [];
		var actions = this.get('model.opponent.actions');
		for ( var i = 0; i < actions.length; i++ ) {
			var action = actions[i];
			results.push(this.convert(action));
		}

		return results;
	}.property('model.opponent.actions')
});

App.ReplyItemController = Ember.Controller.extend({
	needs: ['gameReply'],
	isAction: function() {
		return (this.get('model.opponent.type') === 'question');
	}.property('model.opponent.type'),
	me: function() {
		return this.get('model.me');
	}.property('model.me'),
	opponent: function() {
		return this.get('model.opponent');
	}.property('model.opponent'),
	isUserReply: function() {
		return this.get('controllers.gameReply.model.state') === 'user-reply';
	}.property('controllers.gameReply.model.state')
});