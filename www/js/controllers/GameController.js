(function(){
	angular.module('starter')
	.controller('GameController', ['$scope', '$state', 'localStorageService', 'SocketService', 'moment', '$ionicScrollDelegate', GameController]);
	
	function GameController($scope, $state, localStorageService, SocketService, moment, $ionicScrollDelegate){

		var me = this;
		me.current_user = localStorageService.get('username');
		me.opponent_user = localStorageService.get('opponent_user');
		$scope.images = [];

		$scope.loadImages = function() {
			var player_names = ['','Lionel Messi', 'Arjen Robben','Christiano Ronaldo', 'Angel Di Maria', 'Sergio Ramos', 'Bastian Schweinsteiger', 'Neymar','Toni Kroos','David Villa','Karim Benzema','Luis Suarez','Gareth Bale','Zlatan Ibrahimovic','Wayne Rooney'];
			var known_names = ['','messi', 'robben','ronaldo', 'maria', 'ramos', 'schweinsteiger', 'neymar','kroos','villa','benzema','suarez','bale','ibrahimovic','rooney'];
	        for(var i = 1; i < 15; i++) {
	            $scope.images.push({id: i, src: "img/image-"+i+".png", name: player_names[i], known_name: known_names[i]});
	        }
    	};


    	var selected = [];

        $scope.clicked = function (item) {
            var index = selected.indexOf(item);
            if (index > -1) {
                selected.splice(index, 1);
                item.selected = false;
            } else {
                selected.push(item);
                item.selected = true;
                if(selected.length >=3){
					// Prepare current users' team information
					var gameInput = {
						user: localStorageService.get('username'),
				    	gameid: localStorageService.get('gameid'),
				    	teamPlayers: [selected[0].known_name,selected[1].known_name,selected[2].known_name],
				    	stream: '',
				    	trackJson: {
				    		track: [selected[0].known_name,selected[1].known_name,selected[2].known_name].toString()
				    	}
				    }
				    console.log('Game Input ',gameInput);
					SocketService.emit("startGame",gameInput);
                	$state.go('game');
                }
            }
            console.log('selected',selected);
        };

			SocketService.on('OverClear',function(data){
				me.grand_winner = localStorageService.get('grand_winner');
			});        

        var current_user_score = null;
		var opponent_user_score = null;
       	SocketService.on('liveResults', function(data){

			if(data.user == localStorageService.get('username')){
				current_user_score = data.output;
			}else{
				opponent_user_score = data.output;
			}
			me.current_user_score = current_user_score;
			me.opponent_user_score = opponent_user_score;

			if(!data.streamOpened){

				var i = 30;
				function startTimer() {
				    var countdownTimer = setInterval(function() {
				        console.log('Seconds',i);
				       	me.timer_time = i;
				        i = i - 1;
				        if (i < 0) {
				            clearInterval(countdownTimer);
				        }
				    }, 1000);
				}
				startTimer();

				console.log("timer started");
				var tempInterval = setInterval(function(){
					var winner_selection = [];
					var current_user_wins = 0;

					if(current_user_score[0].value > opponent_user_score[0].value){
						winner_selection.push('0');
						current_user_wins += 1; 
					}else{
						winner_selection.push('1');
					}
					if(current_user_score[1].value > opponent_user_score[1].value){
						winner_selection.push('0');
						current_user_wins += 1; 
					}else{
						winner_selection.push('1');
					}
					if(current_user_score[2].value > opponent_user_score[2].value){
						winner_selection.push('0');
						current_user_wins += 1; 
					}else{
						winner_selection.push('1');
					}

					if(current_user_wins>1)
						me.grand_winner = localStorageService.get('username');
					else		
						me.grand_winner = localStorageService.get('opponent_user');

					me.winner_selection = winner_selection;
					console.log('winner_selection ',winner_selection);
					console.log('grand_winner ',me.grand_winner);
					localStorageService.set('grand_winner',me.grand_winner);
					clearInterval(tempInterval);
					SocketService.emit('endGame',{gameid:data.gameid});
				},35000);
			}
		});
    }

})();