var login = require('./login');
var api = require('./api');
var main = require('./main');
var admin = require('./admin');

exports.init = function( app ) {	
	login.install( app );
	api.install( app );
	main.install( app );
	admin.install( app );
};