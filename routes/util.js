var BSON = require('mongodb').BSONPure;

var extract = function( req, key ) {
	return req.body[key] || req.param(key) || req.headers[key];
};

exports.extractToken = function( req ) {
	return extract(req, 'token');
};

exports.extract = extract;

/**
 * Returns a random value from 0 to max inclusively
 */
exports.random = function( max ) {
	var rand = Math.random() * max
	return Math.round(rand);
};

exports.toObjectId = function( id ) {
	return new BSON.ObjectID(id);
};

exports.isObjectId = function( id ) {
  return !(id != null && 'number' != typeof id && (id.length != 12 && id.length != 24))
};

exports.log = function( data ) {
	if ( typeof( data ) === 'string' )
		console.log(data)
	else
		console.log(JSON.stringify( data ));
};

exports.isString = function( s ) {
	return typeof(s) === 'string';
};
