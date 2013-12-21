var _ = require('underscore');
var BSON = require('mongodb').BSONPure;

var Action = function() {
	this.options = {
		id: id || new BSON.ObjectID(),
		modified: new Date(),
		by: '',
		action: '',
		value: '',
		gameid: '',
		reply: ''
	};
};

Action.prototype = {
	get: function() {
		return {
			_id: this.options.id;
		};
	}
}