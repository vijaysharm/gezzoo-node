exports.install = function( app ) {
	app.get('/', function( req, res ) {
		res.sendfile('views/index.html');
	});
};