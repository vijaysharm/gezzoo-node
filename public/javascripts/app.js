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
App.FOR_NAVIKA = false;
// 'http://placehold.it/214x317';
App.USER_AVATAR = 'http://placehold.it/64x64';
App.OPPONENT_AVATAR = 'http://placehold.it/64x64';
App.en = {
	'index': {
		title: "Guess Who? for you ... Navika Dutta <3",
		instructions: "Happy Birthday my love! So all these weeks, and you've been wondering what I've been working on. Well here it is! It's Guess Who? Except I'm not sure if I'm allowed to call it Guess Who, so I called it Gezzoo.. get it?? lol! Anyways, I wrote this game for you as a birthday present. It's a little rough, but I hope you like :) If nothing else, it'll just be a fun game for us to play when we're bored. I just want to tell you what you mean to me, without you, my world would be incomplete. I love you very much, you are my inspiration, my heart and my everything. I wish you the happiest of birthdays!",
		button: "So Whenever you're ready to play, press here!",
	},
	'user.view': {
		instructions: "Start a new game by pressing the + button, or press any of the games in progress.",
		your_turn: "It's your turn",
		their_turn: "It's their turn",
		game_over: 'Game over :('
	},
	'game.select': {
		instructions: Handlebars.compile("Select your character from the choices below! {{opponent}} will have to guess who you chose.")
	},
	'game.board': {
		instructions1: Handlebars.compile("Try to guess who you think {{opponent}} has. You can press any of the faces below and flip them over if you think {{opponent}} hasnt chosen them. Or hit the 'Questions' tab, and ask them a question!"),
		instructions2: Handlebars.compile("Its not your turn right now, maybe taking a look at the past questions might help you figure out who {{opponent}} might have!")
	},
	'game.reply': {
		instructions: Handlebars.compile("Below is a list of questions that {{opponent}} has asked you. You have to reply to their question before you have a chance to guess theirs.")
	},
	'new.game.modal': {
		title: 'Creating...',
		loading: 'Hang in there... we just gotta find you someone to play with. Then youll get to pick your character.',
		success: 'Done!',
		fail: "D'oh! Failed to create a new game for you :( ... Maybe you can try again a little later?",
		fail_button: "Fineahh!"
	},
	'select.modal': {
		title: 'Saving...',
		loading: 'Ok, just saving your selection to the cloud! After this, you will have to wait for your friend to play',
		success: 'Done!',
		fail: "ARGGHHH! I failed to save your choice. Wanna go back home and try another game?",
		fail_button: "Whatever.."
	},
	'guess.modal': {
		title: 'Checking...',
		loading: 'Verifying if your guess is the right one... Just gimme a sec',
		success: 'Done!',
		fail: "Hmmm, looks like something isn't right. I can't save your guess. Mind trying again later?",
		fail_button: "OK?",
		guess_right_title: "NICE!",
		guess_right_text: Handlebars.compile("You're right! {{opponent}} had {{character}}! I'll let {{opponent}} know."),
		guess_right_button: "Yay!",
		guess_wrong_title: "Nope",
		guess_wrong_text: Handlebars.compile("{{opponent}} didn't have {{character}}. Good guess though. You'll have to let {{opponent}} go next before you can go again."),
		guess_wrong_button: "Ugh...:(",
	},
	'ask.modal': {
		title: 'Asking...',
		loading: "Alright, I'll ask your friend your question. Hopefully they give you an answer that will help.",
		success: 'Done!',
		fail: "Ooops! There's a bit of a problem. Go out, have a coffee, come back in a bit and hopefully I'll have fixed things.",
		fail_button: "Boo-urns"
	},
	'reply.modal': {
		title: 'Replying...',
		loading: "Gimme a sec, need to talk to the internet server thingy, just sending your reply out.",
		success: 'Done!',
		fail: "Dammit! There was some kinda problem. I couldn't save your reply. You can try again, or maybe you can come back and try again later.",
		fail_button: "Sure..."
	},
};
App.lang = function( category, key, value ) {
	var l = App.en[category][key];
	if ( _.isFunction(l) ) {
		return l(value);
	} else if ( _.isString(l) ) {
		return l;
	}
	return "null";
};

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
		confirm: function() {
			var confirm = this.get('model.confirm');
			if ( confirm && confirm.callback ) {
				confirm.callback();
			} else {
				this.send('hideModalDialog');
			}
		}
	}
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
	    	var e = this.get('model.up');
	    	if (( typeof e ) === "boolean" ) {
	    		return e;
	    	} else {
				return e === "true" ? true:false;
	    	}
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
		updateDialog: function(id, data) {
			this.controllerFor(id).set('model', data);
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

App.ApplicationController = Ember.Controller.extend({
	user: null,
	token: localStorage.token,
	tokenChanged: function() {
		console.log('token changed: ' + this.get('token'));
		localStorage.token = this.get('token');
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
	doDialog: function(url, data, category, success, responseHandler) {
		var self = this;
		self.send('showModalDialog', 'modal', {
			title: App.lang(category, 'title'),
			text: App.lang(category, 'loading')
		});

		var post = Ember.$.post(url, data);

		$.when( post, wait( 2000 ) ).then(function(response) {
			var content = responseHandler ? responseHandler( response[0] ) : null;

			if ( content ) {
				self.send('updateDialog', 'modal', {
					title: content.title, //App.lang(category, 'title'),
					text: content.text, //App.lang(category, 'fail'),
					confirm: {
						text: content.button_text, //App.lang(category, 'success_button')
						callback: function() {
							self.send('hideModalDialog');
							if (success) success(response[0]);
						}
					}
				});
			} else {
				self.send('updateDialog', 'modal', {
					title: App.lang(category, 'title'),
					text: App.lang(category, 'success'),
				});
				$.when( wait( 500 ) ).then(function() {
					self.send('hideModalDialog');
					if (success) success(response[0]);
				});
			}
				

		}, function(err) {
			self.send('updateDialog', 'modal', {
				title: App.lang(category, 'title'),
				text: App.lang(category, 'fail'),
				confirm: {
					text: App.lang(category, 'fail_button'),
					callback: function() {
						self.send('hideModalDialog');
					}
				}
			});
		});
	},
	newgame: function(opponentid) {
		var self = this;
		var data = { token: this.get('token') };
		if ( opponentid ) data.opponent = opponentid;
		this.doDialog( '/api/games', data, 'new.game.modal', function( response ) {
			var token = self.get('token');
			var gameid = response._id;
			self.transitionToRouteAnimated('game.select', {main: 'slideLeft'}, token, gameid);
		});
	},
	select: function( gameid, characterid, me ) {
		var data = { 
			token: this.get('token'),
			character: characterid
		};
		var self = this;
		this.doDialog( '/api/games/' + gameid + '/character', data, 'select.modal', function( response ) {
			console.log('me: ' + me);
			console.log('turn: ' + response.turn);
			if ( me === response.turn ) {
				self.transitionToRouteAnimated('game.board', {main: 'slideLeft'}, self.get('token'), gameid);
			} else {
				self.transitionToRouteAnimated('index', {main: 'slideRight'});
			}
		});
	},
	ask: function( gameid, question, board ) {
		var data = {
			token: this.get('token'),
			question: question,
			player_board: board
		};
		var self = this;
		this.doDialog('/api/games/' + gameid + '/question', data, 'ask.modal', function() {
			self.transitionToRouteAnimated('index', {main: 'slideRight'});
		});
	},
	guess: function( gameid, character, board, opponent ) {
		console.log(character);
		var data = {
			token: this.get('token'),
			character: character._id,
			player_board: board
		};
		var self = this;
		this.doDialog('/api/games/' + gameid + '/guess', data, 'guess.modal', function() {
			self.transitionToRouteAnimated('index', {main: 'slideRight'});
		}, function( response ) {
			var text = {
				opponent: opponent,
				character: character.name
			};
			var result = response.guess ? 'right' : 'wrong';
			
			return {
				title: App.lang('guess.modal', 'guess_' + result + '_title'),
				text: App.lang('guess.modal', 'guess_' + result + '_text', text),
				button_text: App.lang('guess.modal', 'guess_' + result + '_button')
			};
		});
	},
	reply: function( gameid, questionid, reply ) {
		var data = { 
			token: this.get('token'),
			question: questionid,
			reply: reply
		};

		var self = this;
		this.doDialog('/api/games/' + gameid + '/reply', data, 'reply.modal', function() {
			self.transitionToRouteAnimated('game.board', {main: 'slideLeft'}, self.get('token'), gameid);
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
		if ( ! App.FOR_NAVIKA ) {
			var app = this.controllerFor('application');
			var token = app.get('token');
			this.transitionTo('user.view', token);
		}
	}
});

App.IndexController = Ember.Controller.extend({
	needs: ['application'],
	actions: {
		go: function() {
			var app = this.get('controllers.application');
			var token = app.get('token');
			this.transitionToRouteAnimated('user.view', {main: 'slideLeft'}, token);
		}
	},
	forNavika: App.FOR_NAVIKA,
	title: App.lang('index', 'title'),
	instructions: App.lang('index', 'instructions'),
	button: App.lang('index', 'button')
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
	},
	instructions: App.lang('user.view', 'instructions')
});

App.GameItemController = Ember.Controller.extend({
	needs: ['application'],
	actions: {
		select: function() {
			var token = this.get('controllers.application.token');
			var gameid = this.get('model._id');
			var state = this.get('model.state');
			var ended = this.get('model.ended');
			var transition = {main: 'slideLeft'};

			if ( ended === true ) {
				var id = this.get('model.me._id');
				var winner = this.get('model.winner.by');
				if ( id === winner ) {
					this.transitionToRouteAnimated('game.board', transition, token, gameid);
				} else {
					this.transitionToRouteAnimated('game.reply', transition, token, gameid);
				}
			} else if ( 'user-action' === state ) {
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
		if ( game.ended ) {
			return App.lang('user.view', 'game_over');
		} else  {
			var turn = game.turn === game.me._id;
			return turn ? App.lang('user.view', 'your_turn') : App.lang('user.view', 'their_turn');
		}
	}.property('model.turn'),

	username: function(key, value) {
		var game = this.get('model');
		return game.opponent.username;
	}.property('model.opponent.username'),

	useravatar: function() {
		return App.USER_AVATAR;
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
					avatar: App.OPPONENT_AVATAR,
					value: action.value,
					type: action.action
				};

				data.me = {
					avatar: App.USER_AVATAR,
				};

				if ( action.reply ) {
					data.me.value = action.reply.value;
				}
			} else if ( action.action === 'guess' ) {
				var isWinner = false;
				var winner = this.get('model.winner');
				if ( winner ) {
					isWinner = winner.by === this.get('model.opponent._id') &&
							   winner.actionid === action._id;
				}

				var character = this.findCharacterById( action.value );
				data.opponent = {
					name: this.get('model.opponent.username'),
					avatar: App.OPPONENT_AVATAR,
					type: action.action,
					character: character,
					right: isWinner ? "right!" : "wrong."
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
		},
		replay: function() {
			var opponentid = this.get('controllers.gameReply.model.opponent._id');
			var controller = this.get('controllers.application');
			controller.newgame(opponentid);
		}
	},
	postReply: function( reply ) {
		var gameid = this.get('controllers.gameReply.model._id');
		var application = this.get('controllers.application');
		var questionid = this.get('model.opponent.id');

		application.reply( gameid, questionid, reply );
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
	}.property('controllers.gameReply.model.state'),
	selectedCharacter: function() {
		var controller = this.get('controllers.gameReply');
		var mycharacter = this.get('controllers.gameReply.model.me.character');
		return controller.findCharacterById( mycharacter );
	}.property('controllers.gameReply.model.me.character'),
	lost: function() {
		var ended = this.get('controllers.gameReply.model.ended');
		var winner = this.get('controllers.gameReply.model.winner');
		var userid = this.get('controllers.gameReply.model.opponent._id');
		if ( ended === true && winner ) {
			 return winner.by === userid;
		} else {
			return false;
		}
		return true;
	}.property('controllers.gameReply.model.ended')
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
	instructions: function() {
		var opponent = {
			opponent: this.get('model.opponent.username')
		};
		if ( this.get('model.state') === 'user-action' ) {
			return App.lang('game.board','instructions1', opponent);
		} else {
			return App.lang('game.board','instructions2', opponent);
		}
	}.property('model.opponent.username'),
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
				avatar: App.USER_AVATAR,
				value: action.value
			};

			if ( action.reply ) {
				data.opponent = {
					name: this.get('model.opponent.username'),
					avatar: App.OPPONENT_AVATAR,
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
					avatar: App.USER_AVATAR,
					value: action.value,
					type: action.action
				};

				if ( action.reply ) {
					data.opponent = {
						name: this.get('model.opponent.username'),
						avatar: App.OPPONENT_AVATAR,
						value: action.reply.value
					};
				}
			} else if ( action.action === 'guess' ) {
				var isWinner = false;
				var winner = this.get('model.winner');
				if ( winner ) {
					isWinner = winner.by === this.get('model.me._id') && 
							   winner.actionid === action._id;
				}

				var character = this.findCharacterById( action.value );
				data.me	= {
					character: character,
					type: action.action,
					avatar: App.USER_AVATAR,
					right: isWinner ? "right!" : "wrong."
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
	avatar: function() {
		return App.USER_AVATAR;
	}.property('model.me'),
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
	guess: function( character ) {
		var gameid = this.get('model._id');
		var board = this.getUserBoard();
		var application = this.get('controllers.application');
		var opponent = this.get('model.opponent.username');
		application.guess( gameid, character, board, opponent );
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
			var up = this.get('model.up');
			this.set('model.up', !up);
			this.get('controllers.gameBoard').set('selection', '');
			var controller = this.get('controllers.gameBoard');
			controller.guess(this.get('model'));
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
	}.property('model.opponent'),
	avatar: function() {
		return this.get('model.me.avatar');
	}.property('model.me.avatar')
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
	instructions: function() {
		return App.lang('game.select', 'instructions', {
			opponent: this.get('model.opponent.username')
		});
	}.property('model.opponent.username'),
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
		var me = this.get('model.me._id');
		this.set('current_selection', '');
		application.select( gameid, characterid, me );
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
