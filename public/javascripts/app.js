App = Ember.Application.create({
	LOG_TRANSITIONS: true,
});

App.Router.map(function() {
	this.route('/');
	this.resource('user', { path: ':user' }, function() {
		this.route('view');
		this.resource('game', { path:':game' }, function() {
			this.route('select');
			this.route('board');
			this.route('reply');
		});
	});
});

/** Application **/
// TODO: This can be removed. I'm hard coding
//		 a path to a game.
// TODO: Handle replies.
App.ApplicationController = Ember.Controller.extend({
	usertokens: [
		'52728fbf63a64c904c657ed5',
		'52728ca9954deb0b31000004',
		'52728fbf63a64c904c657ea6',
		'22728fbf63a64c904c657eaa'
	],
	token: '52728fbf63a64c904c657ed5',
	user: null,
	tokenChanged: function() {
		console.log('token changed: ' + this.get('token'));
		this.set('user', null);
		this.transitionToRoute('index');
	}.observes('token'),
	login: function() {
		var token = this.get('token');
		console.log('login: ' + token);
		var self = this;
		var data = token ? {token:token} : {};
		return Ember.$.post('/api/login', data).then(function(response) {
			self.set('user', {
				id: response.id,
				name: response.name,
				token: response.token
			});
			self.set('token', response.token);
		}, function(err) {
			console.log('login fail:');
			console.log(JSON.stringify(err));
		});
	},
	ask: function( question, board, callback ) {
		var data = {
			token: this.get('token'),
			question: question,
			player_board: board
		};
		console.log('ask data: ');
		console.log(JSON.stringify(data));
	},
	guess: function( characterid, board, callback ) {
		var data = {
			token: this.get('token'),
			character: characterid,
			player_board: board
		};

		console.log('guess data: ');
		console.log(JSON.stringify(data));
	},
	select: function( characterid, callback ) {
		var data = { 
			token: this.get('token'),
			character: characterid
		};

		console.log('set character data: ');
		console.log(JSON.stringify(data));
	}
});

App.ApplicationView = Ember.View.extend({
	classNames: ["l-fill-parent"]
});

App.AuthenticatedRoute = Ember.Route.extend({
	beforeModel: function() {
		var app = this.controllerFor('application');
		if ( ! app.get('user') ) {
			return app.login();
		}
	},
});

App.IndexRoute = App.AuthenticatedRoute.extend({
	afterModel: function() {
		var app = this.controllerFor('application');
		var token = app.get('token');
		this.transitionTo('user.view', token);
	}
});

/////////////
// GAME LIST
/////////////
App.UserRoute = App.AuthenticatedRoute.extend({
	model: function() {
		var user = this.controllerFor('application').get('user');
    	var data = {token:user.token};
    	return $.getJSON('/api/games', data);
	}
});

App.UserViewRoute = Ember.Route.extend({
	model: function() {
		return this.modelFor('user');
	}
});

App.GameItemController = Ember.Controller.extend({
	needs: ['application'],
	actions: {
		select: function() {
			var token = this.get('controllers.application.token');
			var gameid = this.get('model._id');
			var state = this.get('model.state');
			if ( 'user-action' === state ) {
				this.transitionToRoute('game.board', token, gameid);
			} else if ( 'user-reply' === state ) {
				this.transitionToRoute('game.reply', token, gameid);
			} else if ( 'user-select-action' === state ) {
				this.transitionToRoute('game.select', token, gameid);
			} else if ( 'read-only' === state ) {
				this.transitionToRoute('game.board', token, gameid);
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

App.GameRoute = App.AuthenticatedRoute.extend({
	model: function( params ) {
		var url = '/api/games/' + params.game;
		var user = this.controllerFor('application').get('user');
    	var data = {token:user.token};
    	return $.getJSON(url, data);
	}
});

///////////////////
// OPPONENT REPLY
///////////////////
App.GameReplyRoute = Ember.Route.extend({
	model: function() {
		return this.modelFor('game');
	}
});

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
	actions: {
		reply: function() {
			var value = $.trim(this.get('userreply'));
			if ( value && value.length !== 0 ) {
				// TODO: Need to get the action id you're replying to.
				console.log('reply: ' + value);
			}			
		}
	},
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

////////////////
// PLAYER BOARD
////////////////
App.GameBoardRoute = Ember.Route.extend({
	model: function() {
		return this.modelFor('game');
	}
});
App.GameBoardView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});
App.GameBoardController = Ember.Controller.extend({
	needs: ['application'],
	actions: {
		board: function() {
			this.set('viewBoard', true);
		},
		question: function() {
			this.set('viewBoard', false);
		},
		ask: function() {
			var value = $.trim(this.get('userquestion'));
			if ( value && value.length !== 0 ) {
				this.postQuestion( value );
			}
		}
	},
	init: function() {
		this._super();
		this.set('viewBoard', true);
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
	}.property('model.me.board'),
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
	}.property('model.state'),
	getUserBoard: function() {
		var board = [];
		_.each(this.get('model.me.board'), function(item) {
			board.push(_.pick(item, '_id', 'up'));
		});

		return board;
	},
	guess: function( id ) {
		var board = this.getUserBoard();
		var application = this.get('controllers.application');
		application.guess( id, board, function() {
			// ??	
		} );
	},
	postQuestion: function( question ) {
		var board = this.getUserBoard();
		var application = this.get('controllers.application');
		application.ask( question, board, function() {
			// ??	
		} );
	}
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

/////////////////////
// CHARACTER SELECT 
/////////////////////
App.GameSelectRoute = Ember.Route.extend({
	model: function( params, transition ) {
		return this.modelFor('game');
	}
});
App.GameSelectView = Ember.View.extend({
	classNames: ["l-fill-parent", "l-container", 't-background']
});
App.GameSelectController = Ember.Controller.extend({
	needs: ['application'],
	characters: function() {
		return this.get('model.board.characters');
	}.property('model.board.characters'),
	selectCharacter: function(id) {
		var application = this.get('controllers.application');
		application.select( id, function() {
			// ??
		} );
	}
});
App.CharacterItemController = Ember.Controller.extend({
	needs: ['gameSelect', 'gameBoard', 'game'],
	actions: {
		select: function() {
			var controller = this.get('controllers.gameSelect');
			controller.selectCharacter(this.get('model._id'));
		},
		guess: function() {
			var controller = this.get('controllers.gameBoard');
			controller.guess(this.get('model._id'));
		},
		flip: function() {
			var up = this.get('model.up');
			this.set('model.up', !up);
		}
	},
	img: function() {
		var character = this.get('model');
		return character.img;
	}.property('model.img'),
	name: function() {
		var character = this.get('model');
		return character.name;
	}.property('model.name'),
	isUserSelection: function() {
		var state = this.get('controllers.game.model.state');
		return state === 'user-select-action';
	}.property('controllers.game.model.state'),
	isUserAction: function() {
		var state = this.get('controllers.game.model.state');
		return state === 'user-action';
	}.property('controllers.game.model.state'),
	up: function(key, value) {
	    if (value === undefined) {
	      return this.get('model.up');
	    } else {
	      model.set('up', value);
	      return value;
	    }
	}.property('model.up')
});