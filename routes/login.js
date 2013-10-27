var login = function( req, res ) {
	var username = req.body.username;
	if ( username === null ) {
		res.json(401, {error:'Need to provide a username'});
	} else {
		var token = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		res.json({ token: token });
	}
};

var logout = function( req, res ) {
	
};

exports.authenticate = function( req, res, next ) {
	var token = req.body.token || req.param('token') || req.headers.token;
	if( token ) {
		next();
	} else {
		res.json(401, { error:'Invalid token provided' });
	}
};

exports.install = function( app ) {
	app.post('/login', login );
	app.get('/logout', logout );
};