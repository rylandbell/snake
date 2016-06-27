$(document).ready(function(){
	//initialize "global" variables:
	var currentDirection;
	var numIterations;
	var startingSnakeLength=6;
	var snakeLength;
	var activeRow;
	var activeColumn;
	var gridSize;
	var squareWidth;
	var myTimer;
	var gameSpeed;
	var currentScore;

	createGame();

	//Listens for new game button:
	$('#newgame').on('click',function(){
		createGame();
	});
	
	//Listens for arrow key presses, updates direction accordingly:
	$(this).on('keydown',function(e){
		switch(e.which) {
		    case 37:
		    	e.preventDefault();
		    	if(currentDirection!="right"){
						currentDirection = "left";
					}
		      break;
	      case 39:
	        e.preventDefault();
	        if(currentDirection!="left"){
						currentDirection = "right";
					}
		      break;
	      case 38:
	       	e.preventDefault();
	        if(currentDirection!="down"){
						currentDirection = "up";
					}
		      break;
	      case 40:
	        e.preventDefault();
	        if(currentDirection!="up"){
						currentDirection = "down";
					}
		      break;
		}
	});

	function createGame(){
		$('.announcebox').hide();
		currentScore=0;
		currentDirection="";
		numIterations = 0;
		snakeLength = startingSnakeLength;
		activeRow = 5;
		activeColumn = 5;
		gridSize = 16;
		gameSpeed = 150;
		squareWidth = 30;

		drawGrid(gridSize);
		updateGrid(activeRow,activeColumn);
		newApple();
		myTimer = setInterval(function(){
			move(currentDirection);
		},gameSpeed);
		displayHighScore();
		$('#currentscore').text(currentScore);
		$('#highscore').show();
	}

	function adjustSize(){
		var rowWidth = squareWidth*gridSize+(gridSize);
		$('.gridsquare').css({width: squareWidth, height: squareWidth});
		$('.gridRow').css({width: rowWidth, height: squareWidth});
		$('#gamecontainer').css({width: rowWidth});
	}

	//updates background variables, calls on updateGrid to update the visible gameboard
	function move(direction){
		switch(direction){
			case "left":
				activeColumn--;
				break;
			case "right":
				activeColumn++;
				break;
			case "up":
				activeRow--;
				break;
			case "down":
				activeRow++;
				break;
			default:
				break;
		}
		numIterations++;
		updateGrid(activeRow,activeColumn);
	}

	//update the visible gameboard after move
	function updateGrid(row,column){
		if(collisionCheck()){
		//if game isn't over, update the grid:
		appleCheck();
		var expired = numIterations-snakeLength;
		$('.created'+expired).removeClass('active');
		$('#square'+row+'x'+column).addClass('active created'+numIterations);
		}
	}	

	//draw a new "apple"
	function newApple(){
		var appleRow = Math.floor(Math.random()*(gridSize-2)+1);
		var appleColumn = Math.floor(Math.random()*(gridSize-2)+1);
		var $apple = $('#square'+appleRow+"x"+appleColumn);
		if($apple.hasClass('active')){
			newApple();
		} else{
			$apple.addClass('apple');
		}
	}

	//am i hitting an apple after this move?
	function appleCheck(){
		var $nextSquare = $('#square'+activeRow+'x'+activeColumn);
		if($nextSquare.hasClass('apple')){
			$('.apple').removeClass('apple');
			newApple();
			snakeLength++;
			currentScore++;
			$('#currentscore').text(currentScore);
		}
	}

	//returns false for collision, true for none
	function collisionCheck(){
		//don't end the game before the first move:
		if(currentDirection===""){
			return true;
		}
		//check for snake collisions:
		var $nextSquare = $('#square'+activeRow+'x'+activeColumn);
		if($nextSquare.hasClass('active')){
			$nextSquare.addClass('collision');
			gameOver();
			return false;
		}
		//check for border collisions:
		if(activeRow<0||activeRow>=gridSize||activeColumn<0||activeColumn>=gridSize){
			$('.created'+(numIterations-1)).addClass("collision");
			gameOver();
			return false;
		}
		return true;
	}

	//starts new game:
	function drawGrid(n){
		$('#gameboard').empty();
		for (var i = 0; i<n; i++){
			var $newRow = $('<div class = "gridrow">');
			$('#gameboard').append($newRow);
			for (var j = 0; j<n; j++){
				var $newDiv = $('<div class = "gridsquare" id ="square'+i+"x"+j+'">');
				$('.gridrow:eq('+i+')').append($newDiv);
			}
		}
		adjustSize();
	}

	//ends game, brings up end-game displays
	function gameOver(){
		clearInterval(myTimer);
		$('.active').delay(500).animate({
			opacity:0
		},2000);
		$("#announce1").delay(500).fadeIn(500);	
		var highScores = JSON.parse(localStorage.highScores);
		if(currentScore<=highScores[2].score){
			$('#highscore').hide();
			$("#announce1").delay(1500).fadeOut(500);
			$("#announce2").delay(1500).fadeIn(500);
			setTimeout(function() {
  				$('#newgame').focus();
			}, 2001);	
		}		
		setTimeout(function() {
  			$('#initialsbox').focus();
		}, 501);	
	}

	function handleHighScore(initials){
		var userKey = Math.random();
		var highScores = JSON.parse(localStorage.highScores);
		var currentUser = {
			name: initials,
			score: currentScore,
			date: new Date(),
			userKey: userKey
		};
		highScores.push(currentUser);
		highScores.sort(function(a,b){
			if (a.score<b.score){
				return 1;
			}else if (a.score>b.score){
				return -1;
			} else {
				return 0;
			}
		});
		highScores = highScores.slice(0,3);

		//finds rank of new highscore, so that I can highlight that row of the table
		var currentUserRank;
		for (var i=0;i<highScores.length;i++){
			if(highScores[i].userKey===userKey){
				currentUserRank=i;
			}
		}

		localStorage.highScores = JSON.stringify(highScores);	
		displayHighScore(currentUserRank);	
	}

	//listens for submission of initials form
	$('#initials').on('submit',function(e){
		e.preventDefault();
		var init = $('#initialsbox').val();
		if(lettersOnly(init)){
		$('#initialsbox').val("");
			init=init.toUpperCase();
			handleHighScore(init);
			$('#announce1').fadeOut(500);
			$('.currentuserrow td').css({opacity:0}).delay(500).animate({opacity:1},700);
			$('#announce2').fadeIn(500);
			$('#newgame').focus();
			$('#lettersonly').hide();
		} else {
			$('#lettersonly').fadeIn(300);
		}

	});

	function lettersOnly(initials){
		for (var i=0;i<initials.length;i++){
		    var charCode = initials.charCodeAt(i);
		    if (charCode<65 || charCode>122 || (charCode>90 && charCode <97)){
		        return false;
		    }
		}
		return true;
	}

	function displayHighScore(currentUserRank){
		if(!localStorage.highScores){
			localStorage.highScores=JSON.stringify([{name: "AAA", score: 0},{name: "AAA", score: 0},{name: "AAA", score: 0}]);
		}
		var highScores = JSON.parse(localStorage.highScores);
		$('#highscoreholder').empty();

		var $scoreTable=$('<table>');
		var $tableHead="<thead><tr><th>Player</th><th>Score</th></tr></thead>";
		$scoreTable.append($tableHead);
		for (var i=0; i<highScores.length; i++){
			var $row = $('<tr>');
			for (var j=0; j<2; j++){
				var $datum = $('<td>');
				switch(j){
					case 0:
						$datum.text(highScores[i].name);
						$datum.addClass('playername');
						break;
					case 1:
						$datum.text(highScores[i].score);
						$datum.addClass('score');
						break;
					case 2:
						$datum.text(highScores[i].date);
						break;	
				}
				$row.append($datum);
			}
			$scoreTable.append($row);
		}
		$('#highscoreholder').append($scoreTable);
		//highlights current user's score:
		if(currentUserRank>=0){
			$('#highscoreholder tr:eq('+(currentUserRank+1)+')').addClass('currentuserrow');
		}
	}

	//fade instructions box out on first snake movement:
	$(this).on('keydown',function(e){
		if(e.which >= 37 && e.which <=40){
			$('#instructions').fadeOut(1000);
		}
	});
});