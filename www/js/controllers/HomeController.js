(function(){
	angular.module('starter')
	.controller('HomeController', ['$scope', '$state', 'localStorageService', 'SocketService', HomeController]);
	
	function HomeController($scope, $state, localStorageService, SocketService){

		var me = this;
		me.current_room = localStorageService.get('room');
		me.rooms = ['Baseball', 'Basketball', 'Cricket', 'Football', 'Soccer', 'Tennis'];
		me.current_user = localStorageService.get('username');
		me.current_user_image = localStorageService.get('current_user_image');
		me.opponent_user = localStorageService.get('opponent_user');
		me.opponent_user_image = localStorageService.get('opponent_user_image');
		var sample_users = ['Karun', 'Ganesh', 'Archana', 'Priyanka', 'Visakh', 'Verma', 'Bhalla'];
		

		$scope.initUsername = function(){
			var tempIndex = Math.floor(Math.random()*sample_users.length);
			me.temp_user = sample_users[tempIndex];
			me.current_user_image = 'img/profile-'+tempIndex+'.jpg';
			localStorageService.set('current_user_image','img/profile-'+tempIndex+'.jpg');
		};

		

		$scope.login = function(username){
			localStorageService.set('username', username);
			console.log('username ',username);
			$state.go('rooms');
		};


		$scope.enterRoom = function(room_name){

			me.current_room = room_name;
			localStorageService.set('room', room_name);
			//$scope.test = "hekoo";

			// Create a new game
			SocketService.emit('newGame',localStorageService.get('username'));

			SocketService.on('wait',function(data){
				var message = data.msg;
				if(!message.indexOf('new game') > -1){
					localStorageService.set('opponent_user', message[0]);
					localStorageService.set('opponent_user_image','img/profile-'+sample_users.indexOf(message[0])+'.jpg');
				}
				$state.go('room');	
			});

		};


		SocketService.on('GameRoomReady', function(data){
			localStorageService.set('gameid', data.game.id);
			if(localStorageService.get('opponent_user') == 'n'){
				if(localStorageService.get('username') == data.game.players[0]){
					localStorageService.set('opponent_user', data.game.players[1]);
					localStorageService.set('opponent_user_image','img/profile-'+sample_users.indexOf(data.game.players[0])+'.jpg');
				}
				else{
					localStorageService.set('opponent_user', data.game.players[0]);
					localStorageService.set('opponent_user_image','img/profile-'+sample_users.indexOf(data.game.players[0])+'.jpg');
				}
			}
			$state.go('player');
		});		

	}

})();