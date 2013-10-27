var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/gezzoo';
exports.getInstance = function( callback ) {
	mongo.Db.connect( mongoUri, function( err, db ) {
		if( err ) throw err;
		callback( db );
	});
};