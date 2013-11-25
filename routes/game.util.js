var _ = require('underscore');
var util = require('./util');
var isString = util.isString;
var toObjectId = util.toObjectId;

exports.extractOpponent = function(user, game) {
	return _.find(game.players, function(player) {
		return ! user._id.equals(player);
	});
};

function objId( p ) {
	return isString( p ) ? toObjectId( p ) : p;
};

exports.Game = function( id ) {
	if ( id ) this.id = objId( id );
	this.ended = false;
	this.turn = null;
	this.players = [];
	this.board = null;
	this.actions = [];
	this.player_board = [];
	this.selected_characters = [];
	
	var that = this;

	return {
		ended: function( e ) {
			that.ended = e;
			return this;
		},
		id: function( i ) {
			that.board = objId( b );
			return this;
		},
		addPlayer: function( p ) {
			var pid = null;
			if ( isString ( p ) ) {
				pid = toObjectId( p );
			} else if ( p.id ) {
				pid = objId( p.id );
			} else {
				pid = p;
			}

			that.players.push( pid );
			that.actions.push({ player: pid, list: [] });
			
			that.player_board.push({ 
				player: pid, 
				board: p.board || []
			});

			if ( p.character ) {
				that.selected_characters.push({ 
					player: pid,
					character: objId( p.character )
				});
			}

			if ( ! that.turn )
				this.turn( pid );

			return this;
		},
		board: function( b ) {
			that.board = objId( b );
			return this;
		},
		turn: function( t ) {
			that.turn = objId( t );
			return this;
		},
		toDbObject: function() {
			return{
				_id: that.id,
				players: that.players,
				turn: that.turn,
				ended: that.ended,
				board: that.board,
				actions: that.actions,
				player_board: that.player_board,
				selected_characters: that.selected_characters
			};
		}
	};
};