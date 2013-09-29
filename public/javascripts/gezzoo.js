require.config({
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		}
	},
	baseUrl: '/javascripts'
});

require(['router'], function( MainRouter ) {
	new MainRouter();
	Backbone.history.start();
});