var en = {

};

function lang( key ) {
	return en[key];
};

function wait( delay ) {
	var deferred = $.Deferred();

	setTimeout(function() {
		deferred.resolve();
	}, delay);

	return deferred.promise();
}

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

////////////////
// MODAL DIALOG
////////////////
App.ModalController = Ember.ObjectController.extend({
	actions: {
		close: function() {
			this.send('hideModalDialog')
		}
	}
});

App.NewGameModalController = App.ModalController.extend({

});

App.SelectModalController = App.ModalController.extend({

});

App.AskModalController = App.ModalController.extend({

});

App.GuessModalController = App.ModalController.extend({

});

App.ReplyModalController = App.ModalController.extend({

});

App.AbstractCharacterItemController = Ember.Controller.extend({
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
		return state === 'user-select-character';
	}.property('controllers.game.model.state'),
	isUserAction: function() {
		var state = this.get('controllers.game.model.state');
		return state === 'user-action';
	}.property('controllers.game.model.state'),
	up: function(key, value) {
	    if (value === undefined) {
	      return this.get('model.up');
	    } else {
	      this.set('model.up', value);
	      return value;
	    }
	}.property('model.up')
});

////////////////
// APPLICATION
////////////////
App.ApplicationRoute = Ember.Route.extend({
	actions: {
		showModalDialog: function(id, data) {
			this.controllerFor(id).set('model', data);
			return this.render(id, {
				into: 'application',
				outlet: 'modal'
			});
		},
		hideModalDialog: function() {
			return this.disconnectOutlet({
		        outlet: 'modal',
		        parentView: 'application'
		    });
		}
	}
 // , goBack: function() {
 //        Ember.AnimatedContainerView.enqueueAnimations({main: 'slideRight'});
 //        history.go(-1);
 //    }
});

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
	newgame: function() {
		var data = { token: this.get('token') };
		var self = this;
		self.send('showModalDialog', 'new.game.modal', data);

		var post = Ember.$.post('/api/games', data);
		var delay = wait( 2000 );

		$.when( post, delay ).then(function(response) {
			self.send('hideModalDialog');
			var token = self.get('token');
			var gameid = response[0]._id;
			self.transitionToRouteAnimated('game.select', {main: 'slideLeft'}, token, gameid);
		}, function(err) {
			console.log('new game fail:');
			console.log(JSON.stringify(err));
			// TODO: Hide the dialog and show an error.
		});
	},
	select: function( gameid, characterid ) {
		var data = { 
			token: this.get('token'),
			character: characterid
		};
		var self = this;
		this.send('showModalDialog', 'select.modal', data);
		var post = Ember.$.post('/api/games/' + gameid + '/character', data)
		var delay = wait( 2000 );

		$.when( post, delay ).then(function(response) {
			self.send('hideModalDialog');
			self.transitionToRouteAnimated('index', {main: 'slideRight'});
		}, function( err ) {
			console.log('set character fail:');
			console.log(JSON.stringify(err));
			// TODO: Hide the dialog and show an error.
		});
	},
	ask: function( gameid, question, board ) {
		var data = {
			token: this.get('token'),
			question: question,
			player_board: board
		};
		var self = this;
		this.send('showModalDialog', 'ask.modal', data);

		var post = Ember.$.post('/api/games/' + gameid + '/question', data)
		var delay = wait( 2000 );
		$.when( post, delay ).then(function(response) {
			self.send('hideModalDialog');
			self.transitionToRouteAnimated('index', {main: 'slideRight'});
		}, function(err) {
			console.log('ask question fail:');
			console.log(JSON.stringify(err));
			// TODO: Hide the dialog and show an error.
		});
	},
	guess: function( gameid, characterid, board ) {
		var data = {
			token: this.get('token'),
			character: characterid,
			player_board: board
		};
		var self = this;
		this.send('showModalDialog', 'guess.modal', data);
		
		var post = Ember.$.post('/api/games/' + gameid + '/guess', data)
		var delay = wait( 2000 );
		$.when( post, delay ).then(function(response) {
			self.send('hideModalDialog');
			self.transitionToRouteAnimated('index', {main: 'slideRight'});
		}, function(err) {
			console.log('ask question fail:');
			console.log(JSON.stringify(err));
			// TODO: Hide the dialog and show an error.
		});
	},
	reply: function( gameid, questionid, reply ) {
		var data = { 
			token: this.get('token'),
			question: questionid,
			reply: reply
		};

		var self = this;
		this.send('showModalDialog', 'reply.modal', data);

		var post = Ember.$.post('/api/games/' + gameid + '/reply', data)
		var delay = wait( 2000 );

		$.when( post, delay ).then(function(response) {
			self.send('hideModalDialog');
			self.transitionToRouteAnimated('game.board', {main: 'slideLeft'}, self.get('token'), gameid);
		}, function(err) {
			console.log('reply to question fail:');
			console.log(JSON.stringify(err));
			// TODO: Hide the dialog and show an error.
		});
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

App.UserViewController = Ember.ArrayController.extend({
	needs: ['application'],
	actions: {
		newgame: function() {
			var controller = this.get('controllers.application');
			controller.newgame();
		}
	}
});

App.GameItemController = Ember.Controller.extend({
	needs: ['application'],
	actions: {
		select: function() {
			var token = this.get('controllers.application.token');
			var gameid = this.get('model._id');
			var state = this.get('model.state');
			var transition = {main: 'slideLeft'};

			if ( 'user-action' === state ) {
				this.transitionToRouteAnimated('game.board', transition, token, gameid);
			} else if ( 'user-reply' === state ) {
				this.transitionToRouteAnimated('game.reply', transition, token, gameid);
			} else if ( 'user-select-character' === state ) {
				this.transitionToRouteAnimated('game.select', transition, token, gameid);
			} else if ( 'read-only' === state ) {
				this.transitionToRouteAnimated('game.board', transition, token, gameid);
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
	findCharacterById: function( id ) {
		var characters = this.get('model.board.characters');
		return _.find( characters, function( character ) {
			return id === character._id;
		});
	},
	convert: function( action ) {
		var data = {};

		if ( action ) {
			if ( action.action === 'question' ) {
				data.opponent = {
					id: action._id,
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
				var character = this.findCharacterById( action.value );
				data.opponent = {
					name: this.get('model.opponent.username'),
					avatar: 'http://placehold.it/64x64',
					type: action.action,
					character: character
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
	}.property('model.opponent.actions'),
	opponent: function() {
		return this.get('model.opponent.username');
	}.property('model.opponent.username')
});

App.ReplyItemController = Ember.Controller.extend({
	needs: ['gameReply', 'application'],
	actions: {
		reply: function() {
			var value = $.trim(this.get('userreply'));
			if ( value && value.length !== 0 ) {
				this.postReply( value );
			}			
		}
	},
	postReply: function( reply ) {
		var gameid = this.get('controllers.gameReply.model._id');
		var application = this.get('controllers.application');
		var questionid = this.get('model.opponent.id');

		application.reply( gameid, questionid, reply );
	},
	avatar: function() {
		return 'http://placehold.it/214x317';
	}.property('model'),
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
	}.property('controllers.gameReply.model.state'),
	selectedCharacter: function() {
		var controller = this.get('controllers.gameReply');
		var mycharacter = this.get('controllers.gameReply.model.me.character');
		return controller.findCharacterById( mycharacter );
	}.property('controllers.gameReply.model.me.character')
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
	current_selection: '',
	selection: function(key, value) {
	    if (value === undefined) {
	      return this.get('current_selection');
	    } else {
	      this.set('current_selection', value);
	      return value;
	    }
	}.property('current_selection'),
	init: function() {
		this._super();
		this.set('viewBoard', true);
	},
	// TODO: This method needs to look at the modified 
	//		 time to know which is the most recent
	getLastAction: function() {
		var actions = this.get('model.me.actions');
		if ( actions && actions.length > 0 ) {
			return actions[actions.length-1];
		}

		return null;
	},
	// TODO: What if the last action was a guess?
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
	findCharacterById: function( id ) {
		var characters = this.get('model.board.characters');
		return _.find( characters, function( character ) {
			return id === character._id;
		});
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
				var character = this.findCharacterById( action.value );
				data.me	= {
					character: character,
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
	opponent: function() {
		return this.get('model.opponent.username');
	}.property('model.opponent.username'),
	getUserBoard: function() {
		var board = [];
		_.each(this.get('model.me.board'), function(item) {
			board.push(_.pick(item, '_id', 'up'));
		});

		return board;
	},
	guess: function( characterid ) {
		var gameid = this.get('model._id');
		var board = this.getUserBoard();
		var application = this.get('controllers.application');
		application.guess( gameid, characterid, board );
	},
	postQuestion: function( question ) {
		var gameid = this.get('model._id');
		var board = this.getUserBoard();
		var application = this.get('controllers.application');
		this.set('current_selection', '');
		this.set('userquestion', '');
		application.ask( gameid, question, board );
	}
});

App.GameBoardCharacterItemController = App.AbstractCharacterItemController.extend({
	needs: ['gameBoard', 'game'],
	actions: {
		guess: function() {
			this.get('controllers.gameBoard').set('selection', '');
			var controller = this.get('controllers.gameBoard');
			controller.guess(this.get('model._id'));
		},
		flip: function() {
			var up = this.get('model.up');
			this.set('model.up', !up);
		},
		clicked: function() {
			var controller = this.get('controllers.gameBoard');
			if ( controller ) {
				controller.set('selection', this.get('model._id'));
			}
		}
	},
	isselected: function() {
		var selected = this.get('controllers.gameBoard.selection');
		return selected === this.get('model._id');
	}.property('controllers.gameBoard.selection'),
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
	}.property('model.opponent')
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
	current_selection: '',
	opponent: function() {
		return this.get('model.opponent.username');
	}.property('model.opponent.username'),
	selection: function(key, value) {
	    if (value === undefined) {
	      return this.get('current_selection');
	    } else {
	      this.set('current_selection', value);
	      return value;
	    }
	}.property('current_selection'),
	characters: function() {
		return this.get('model.board.characters');
	}.property('model.board.characters'),
	selectCharacter: function(characterid) {
		var application = this.get('controllers.application');
		var gameid = this.get('model._id');
		this.set('current_selection', '');
		application.select( gameid, characterid );
	}
});

App.GameSelectCharacterItemController = App.AbstractCharacterItemController.extend({
	needs: ['gameSelect', 'game'],
	actions: {
		select: function() {
			this.get('controllers.gameSelect').set('selection', '');
			var controller = this.get('controllers.gameSelect');
			controller.selectCharacter(this.get('model._id'));
		},
		clicked: function() {
			var controller = this.get('controllers.gameSelect');
			if ( controller ) {
				controller.set('selection', this.get('model._id'));
			}
		}
	},
	isselected: function() {
		var selected = this.get('controllers.gameSelect.selection');
		return selected === this.get('model._id');
	}.property('controllers.gameSelect.selection'),
});
