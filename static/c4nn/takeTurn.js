function getTable(selectObject){//loads session storage 2d array "grid" and draws table of radio buttons of same dimensions
	var rows = document.getElementById("boardBody").children;
	var boardArray = []
	for (var i = 1; i < rows.length; i++){
	  var row = rows[i].children;
	  var rowArray = []
	  for (var j = 0; j < row.length; j++){
		var cell = row[j].children[0].children[0]
		if (cell.nodeName == "INPUT"){
			rowArray.push([false, false])
		}
		else{
			if (cell.innerHTML == 'X') {rowArray.push([true, true])}
			else {rowArray.push([true, false])}
		}
	  }
	  boardArray.push(rowArray)
	}
	document.getElementById("boardState").value = JSON.stringify(boardArray)
	return boardArray
}

function urlFn(){
	var myVar = (window.location.href.split('/', window.location.href.split('/').length - 1)).join('/');
	window.location.href = myVar
}