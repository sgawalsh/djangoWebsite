function getTable(selectObject){//reads html table and outputs 2d array state representation
	var rows = document.getElementById("boardBody").children;
	var boardArray = []
	for (var i = 1; i < rows.length; i++){
	  var row = rows[i].children;
	  var rowArray = []
	  for (var j = 0; j < row.length; j++){
		var cell = row[j].children[0].children[0]
		if (cell.nodeName == "INPUT") {rowArray.push([false, false])}
		else {rowArray.push([true, cell.innerHTML == 'X' ? true : false])}
	  }
	  boardArray.push(rowArray)
	}
	document.getElementById("boardState").value = JSON.stringify(boardArray)
}

function resetGame(){
	document.getElementById("resetGameFlag").value = true
	document.getElementById("boardState").value = JSON.stringify([[[false, false],[false, false],[false, false],[false, false],[false, false],[false, false],[false, false]],[[false, false],[false, false],[false, false],[false, false],[false, false],[false, false],[false, false]],[[false, false],[false, false],[false, false],[false, false],[false, false],[false, false],[false, false]],[[false, false],[false, false],[false, false],[false, false],[false, false],[false, false],[false, false]],[[false, false],[false, false],[false, false],[false, false],[false, false],[false, false],[false, false]],[[false, false],[false, false],[false, false],[false, false],[false, false],[false, false],[false, false]]])
	document.getElementById("submitForm").submit()
}

function urlFn(){
	var myVar = (window.location.href.split('/', window.location.href.split('/').length - 1)).join('/');
	window.location.href = myVar
}

function toggleAutoplay(autoEl){//Controls fields available based on autoplay selection and player type
	autoGames = document.getElementById('autoPlayGames')
	if(autoEl.checked){
		if(document.getElementById(document.getElementById("playerTurn").value == 1 ? "player1" : "player2").value != "Human Player") {document.getElementById("beginAutoplay").style.display = ""}
		if (document.getElementById("player1").value != "Human Player" && document.getElementById("player2").value != "Human Player"){
			if (document.getElementById("player1").value != "Minimax Algorithm" && document.getElementById("player2").value != "Minimax Algorithm"){
				document.getElementById('backendAutoplay').style.display = ""
			}
			document.getElementById("autoPlayGamesLabel").style.display = ""
			autoGames.type = 'number'
			autoGames.disabled = false
		}
	}
	else{
		document.getElementById("autoPlayGamesLabel").style.display = "none"
		document.getElementById("beginAutoplay").style.display = "none"
		document.getElementById('backendAutoplay').style.display = "none"
		autoGames.type = 'hidden'
		autoGames.disabled = true
	}
}

function checkAutoplay(){//Called on page load, takes turn if current player is not human
	if(document.getElementById(document.getElementById("playerTurn").value == 1 ? "player1" : "player2").value != "Human Player"){
		if(document.getElementById("autoplay").checked) {
			var mySubmit = document.getElementById("takeTurn")
			if(mySubmit.disabled){resetGame()}
			else {mySubmit.click()}
		}
	}
}

function autoPlayBackend(){//changes form target to backendAutoplay
	var myForm = document.getElementById("submitForm")
	myForm.action = "http://127.0.0.1:8000/c4nn/backendAutoplay"
	myForm.submit()
}

window.onload = function(){checkAutoplay()}