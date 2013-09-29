var login = require('./login');
var api = require('./api');
var main = require('./main');

exports.init = function( app ) {	
	login.install( app );
	api.install( app );
	main.install( app );
};