var users = [
	{ 
		username: 'navika',
		password: 'navika'
	}, 
	{ 
		username: 'vijay',
		password: 'vijay'
	},
	{ 
		username: 'slim',
		password: 'slim'
	}
];

exports.findUser = function( username, password ){
	for ( var index in users ) {
		var user = users[index];
		if ( user.username === username && 
			 user.password === password ) {
			return user;
		}
	}

	return null;
};