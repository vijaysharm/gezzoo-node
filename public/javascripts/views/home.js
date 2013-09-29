define(['backbone'], function(Backbone) {
	var HomeView = Backbone.View.extend({
		initialize: function() {
			// Backbone.history.navigate('/#login');
			$.ajax({
				url: '/games',
				type: 'GET',
				dataType: 'json',
				success: function( data ) {
					console.log( data );
				}
			});
		}
	});

	return HomeView;
});