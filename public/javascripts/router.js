define([
'backbone',
'views/login',
'views/home'
], 
function(Backbone,LoginView,HomeView){
	var Main = Backbone.Router.extend({
		routes: {
			'': 'home',
			'login': 'login'
		},
		home: function() {
			var homeView = new HomeView();
			$('#main').html(homeView.el);
		},
		login: function() {
			var loginView = new LoginView();
			$('#main').html(loginView.el);
		}
	});

	$.ajaxSetup({
		status: {
			// Redirect to the login
			401: function() {
				console.log('401!!!');
				// window.location.replace('#login');
				Backbone.history.navigate('/#login');
				// maybe call Main.getCurrentView().showError("")?
			},
			// Access Denied
			403: function() {
				// maybe call Main.getCurrentView().showError("")?
			}
		}
	});

	return Main;
});