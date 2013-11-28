var connection = require('../routes/database')
var request = require('supertest');
var _ = require('underscore');

exports.post = function( url, data, callback ) {
	if ( arguments.length === 2 ) {
		callback = data;
		data = {};
	}

	request(url.domain)
		.post(url.subdomain)
		.send(data)
		.end(function(err, res) {
			if(err) throw err;
			callback(res);
		});
};

exports.get = function( url, token, callback ) {
	request(url.domain)
		.get(url.subdomain)
		.set('token', token)
		.end(function(err, res) {
			if( err ) throw err;
			callback( res );
		});
};