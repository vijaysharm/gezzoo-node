define(['underscore','backbone'], function(_,Backbone) {
	var LoginView = Backbone.View.extend({
		template: _.template($("#loginView").html()),
		events: {
			'click #loginButton': 'login'
		},
		initialize: function() {
			this.$el.html(this.template);
		},
		login: function( event ) {
			event.preventDefault();
			var data = {
				username: $('#username').val(),
				password: $('#password').val()
			};

			$.ajax({
				url: '/login',
				type: 'POST',
				dataType: 'json',
				data: data,
				success: this.loginCallback
			});
		},
		loginCallback: function( data ) {
			if ( data.error ) {
				console.log(data);
			} else {
				Backbone.history.navigate('/#');
			}
		}
	});

	return LoginView;
});