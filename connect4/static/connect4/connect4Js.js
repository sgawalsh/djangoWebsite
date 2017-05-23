function compMove(difficulty){//computer reads table and makes move
	var rootNode = new treeNode(0, readTable())
	connect4MiniMax(rootNode, -200, 200, 0, difficulty)
	var chosenChild = rootNode.chooseChild()
	writeTable(chosenChild.boardClass.board)
	sessionStorage.setItem("moveList", JSON.stringify({userFirst: $("#userFirst").is(".active"), moveList: [chosenChild.colChoice], difficulty: difficulty}))
}

class treeNode{//nodeClass for trees, each node contains a board state and list of potential next mvoes
	constructor(depth, board, colChoice){
		if (typeof(depth) == "undefined"){depth = 0}
		if (typeof(board) == "undefined"){board = new boardClass()}
		if (typeof(colChoice) == "undefined"){colChoice = null}
		this.value = 0
		this.childList = []
		this.depth = depth
		this.boardClass = board
		this.colChoice = colChoice
		if (colChoice != null){this.rowChoice = this.getRowNum()}
		else{this.rowChoice = null}
	}
	
	addNextMoves(){//checks board for legal moves and creates child for each move found
		for (let i = 0; i < 7; i++){
			if (!(this.boardClass.board[0][i].isPopulated)){
				this.childList.push(new treeNode(this.depth + 1, new boardClass(this.boardClass.board, i, this.depth), i))
			}
		}
	}
	
	readMove(){//Check children and find child matching input board. Move to this board then, simulate new tree, and chooseMove()
		var newBoard = readTable()
		for (let i = 0; i < childList.length; i++){
			if (checkBoardsSame(newBoard, this.childList[i].board)){
				this.board = newboard
				this.chooseMove()
				break
			}
		}
	}
	
	chooseChild(){//finds child with max value
		var maxVal = -2000
		var maxChild = null
		for(let i = 0; i < this.childList.length; i++){
			if (this.childList[i].value > maxVal){
				maxVal = this.childList[i].value
				maxChild = this.childList[i]
			}
			else if (this.childList[i].value == maxVal){
				if (tieBreak(this.childList[i], maxChild)){maxChild = this.childList[i]}
			}
		}
		return maxChild
	}
	
	chooseMinChild(){
		var minVal = 2000
		var minChild = null
		for(let i = 0; i < this.childList.length; i++){
			if (this.childList[i].value < minVal){
				minVal = this.childList[i].value
				minChild = this.childList[i]
			}
			else if (this.childList[i].value == minVal){
				if (tieBreak(this.childList[i], minChild)){minChild = this.childList[i]}
			}
		}
		return minChild
	}
	
	getRowNum(){
		for (let i = 0; i < 6; i++){
			if (this.boardClass.board[i][this.colChoice].isPopulated){return i}
		}
	}
	
	sortChildren(){
		this.childList =  sortChildrenRecursive(this.childList)
	}
	
	sortChildrenRecursive(inArray){
		if (inArray.length > 1){
			var pivot = inArray.pop()
			var less = []
			var more = []
			var pivArray = []
			for (let i = 0; i < inArray.length; i++){
				if (inArray[i].value < pivot.value){less.push(inArray[i])}
				else if (inArray [i].value > pivot.value){more.push(inArray[i])}
				else if (inArray[i].value === pivot.value){pivArray.push(inArray[i])}
			}
			less = sortChildrenRecursive(less)
			more = sortChildrenRecursive(more)
			pivArray.push(pivot)
			return less.concat(pivArray).concat(more)
			}
		else {return inArray}
	}
}

function writeTable(board){//writes board to html
	var $board = $("#boardBody")
	$($board).empty()
	var newRow = null
	var newTd = null
	newRow = document.createElement("tr")
	writeHeader(newRow, board)
	$($board).append(newRow)
	for (let i = 0; i < board.length; i++){
		newRow = document.createElement("tr")
		$($board).append(newRow)
		for (let j = 0; j < board[i].length; j++){
			if (board[i][j].isPopulated){
				if (board[i][j].isRed){
					newTd = document.createElement("td")
					newTd.innerHTML = "<center><p>O</p></center>"
					newTd.classList.add("danger")
					newRow.appendChild(newTd)
				}
				else {
					newTd = document.createElement("td")
					newTd.innerHTML = "<center><p>X</p></center>"
					newTd.classList.add("warning")
					newRow.appendChild(newTd)
				}
			}
			else {
				newTd = document.createElement("td")
				newTd.innerHTML = '<center><input type ="radio" name = "playerChoice"></center>'
				newTd.firstChild.firstChild.disabled = true
				newRow.appendChild(newTd)
			}
		}
	}
}

function readTable(){//reads board from html and creates boardClass
	var boardTable = [[],[],[], [], [], []]
	var rowCount = -1
	var tdCount = 0
	var $square = null
	
	$("#boardBody").children("tr").each(function(){
		$(this).find("center").each(function(){
			$square = $(this).children().first()//$square is first child of td
			if ($($square).prop("tagName") == "INPUT" && rowCount >= 0){
				if ($($square).is(":checked")){
					boardTable[rowCount].push(new boardSquare(true, false))//write x to space
				}
				else if (!($($square).is(":checked"))){
					boardTable[rowCount].push(new boardSquare(false, false))//write blank to space
				}
			}
			else if ($($square).prop("tagName") == "P"){
				if ($square.html() == "O"){
					boardTable[rowCount].push(new boardSquare(true, true))//Write O to space
				}
				else if ($square.html() == "X"){
					boardTable[rowCount].push(new boardSquare(true, false))//Write x to space
				}
			}
		})
		rowCount++
	})
	return new boardClass(boardTable)
}

function dropPiece(){//new node is created for current gamestate, loss or tie conditions are checked, then move is chosen, win or tie conditions are then checked as board is written to html
	//read first row to identify column
	var colId = 0
	var colFound = false
	$(".topRow").each(function(){
		if ($(this).is(":checked")){//is column full? if not find lowest available space and set input to checked and call submitMove(rootNode)
			var rootNode = new treeNode(0, readTable())
			if (rootNode.boardClass.board[0][colId].isPopulated){
				alert("Move not valid, column is full.")
			}
			else {
				for (let i = 5; i >=0; i--){
					if (rootNode.boardClass.board[i][colId].isPopulated){continue}
					else{
						rootNode.boardClass.board[i][colId].isPopulated = true
						rootNode.boardClass.board[i][colId].isRed = false
						rootNode.colChoice = colId
						rootNode.rowChoice = i
						colFound = true
						var moveList = JSON.parse(sessionStorage.getItem("moveList"))
						moveList["moveList"].push(colId)
						sessionStorage.setItem("moveList", JSON.stringify(moveList))
						submitMove(rootNode)
						break
					}
				}
			}
			return false
		}
		else {colId++}
	})
	if (!colFound){alert("Please select a column to submit a move")}
}

function submitMove(rootNode){//loss or tie conditions are checked, then move is chosen, win or tie conditions are then checked as board is written to html
	if (rootNode.boardClass.checkSolvedAt(rootNode.colChoice, rootNode.rowChoice)){
		writeTable(rootNode.boardClass.board)
		alert("You win. GJ.")
		recordLoss()
		endGame()
		return
	}
	if (rootNode.boardClass.boardFull()){
		writeTable(rootNode.boardClass.board)
		alert("It's a tie!")
		endGame()
		return
	}
	connect4MiniMax(rootNode, -200, 200, 0, parseInt($("#difficultySetting").val()))
	var chosenMove = rootNode.chooseChild()
	writeTable(chosenMove.boardClass.board)
	var moveList = JSON.parse(sessionStorage.getItem("moveList"))
	moveList["moveList"].push(chosenMove.colChoice)
	sessionStorage.setItem("moveList", JSON.stringify(moveList))
	if (chosenMove.boardClass.checkSolvedAt(chosenMove.colChoice, chosenMove.rowChoice)){
		alert("I win.")
		endGame()
		return
	}
	if (rootNode.boardClass.boardFull()){
		alert("It's a tie!")
		endGame()
		return
	}
}

function writeHeader(newRow, board){
	var myHtml = ""
	for (let i = 0; i < 7; i++){
		if (board[0][i].isPopulated){myHtml += '<th class = "active"><center><input type ="radio" class = "topRow" name = "playerChoice" disabled></center></th>'}
		else {myHtml += '<th class = "success"><center><input type ="radio" class = "topRow" name = "playerChoice"></center></th>'}
	}
	newRow.innerHTML = myHtml
}

function endGame(){//inputs on old board and "submit move" button are disabled
	$(document).ready()
	$(".topRow").each(function (){
		$(this).prop("disabled", true)
	})
	$("#submitMove").prop("disabled", true)
}

function resetBoard(){//new board is created and written, "submit move" button is reactivated
	writeTable((new boardClass()).board)
	$(".topRow").each(function(){
		$(this).prop("disabled", true)
	})
	$("#difficultySetting").prop("disabled", false)
	$("#userFirst").prop("disabled", false)
	$("#submitMove").prop("disabled", true)
	var resetButton = $("#resetButton")
	$(resetButton).prop("value", "Begin Game")
	$(resetButton).off("click", resetBoard)
	$(resetButton).on("click", beginGame)
}

function recordLoss(){
	var moveList = JSON.parse(sessionStorage.getItem("moveList"))
	if (moveList["userFirst"] && moveList["difficulty"] >= 5){
		$.ajaxSetup({
			beforeSend: function(xhr, settings) {
				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
					xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
				}
			}
		});

		$.ajax({
			type: "POST",
			url: "/connect4/recordLoss/",
			data: {data: JSON.stringify(moveList)}
		}).done(function(){console.log('saved')})
	}
}

function tieBreak(nodeA, nodeB){//compare values, return true if a > b, and false if b > a
	var nodeAVal = nodeA.boardClass.scoreList.getSetTotal(nodeA.boardClass.board)
	var nodeBVal = nodeB.boardClass.scoreList.getSetTotal(nodeB.boardClass.board)
	if (nodeAVal > nodeBVal && nodeA.depth % 2 == 1 ||  nodeAVal < nodeBVal && nodeA.depth % 2 == 0){return true}
	else if (nodeAVal < nodeBVal && nodeA.depth % 2 == 1 ||  nodeAVal > nodeBVal && nodeA.depth % 2 == 0){return false}
	else if (nodeAVal == nodeBVal){
		if (nodeA.childList.length > 0 && nodeB.childList.length > 0){
			if (nodeA.depth % 2 == 1){return tieBreak(nodeA.chooseMinChild(), nodeB.chooseMinChild())}
			else {return tieBreak(nodeA.chooseChild(), nodeB.chooseChild())}
		}
		else return false//tie goes to node b
	}
}

function connect4MiniMax(node, alpha, beta, depth, maxDepth){
	if (depth < maxDepth && (node.colChoice == null || !(node.boardClass.checkSolvedAt(node.colChoice, node.rowChoice)))){
		node.addNextMoves()
		if (depth % 2 == 0){node.value = -200}//initialize value on max node
		else if (depth % 2 == 1){node.value = 200}// initialize value on min node
		for (let i = 0; i < node.childList.length; i++){//call self on each child branch in depth-first search until desired depth is reached
			var retValue = connect4MiniMax(node.childList[i], Number(alpha), Number(beta), depth + 1, maxDepth)
			if (depth % 2 == 0){//adjust node value, beta, or alpha values if necessary
					if (retValue > node.value){node.value = retValue}
					if (node.value > alpha) {alpha = node.value}
				}
				else{
					if (retValue < node.value) {node.value = retValue}
					if (node.value < beta){beta = node.value}
				}
				if (alpha >= beta){return node.value}
		}
	}
	else {
		node.value = node.boardClass.scoreList.getSetTotal(node.boardClass.board)
	}
	return node.value
}

class boardClass{//class containing a board and several methods for checking if it is solved
	constructor(inBoard, x, parentDepth){
		var isClone = !(typeof(inBoard) == "undefined")
		this.board = [[], [], [], [], [], []]
		for(let i = 0; i < 6; i++){
			for(let j = 0; j < 7; j++){
				this.board[i].push(new boardSquare)
				if (isClone){
					this.board[i][j].isPopulated = inBoard[i][j].isPopulated
					this.board[i][j].isRed = inBoard[i][j].isRed
				}
			}
		}
		if (!(typeof(x) == "undefined")){
			for (let i = 5; i >= 0; i--){
				if (this.board[i][x].isPopulated){continue}
				else{
					this.board[i][x].isPopulated = true
					this.board[i][x].isRed = (parentDepth % 2 == 0)
					break
				}
			}
		}
		this.scoreList = new scoreList
	}
	
	checkSolvedAt(x, y){
		if (this.checkSolvedRowAt(x, y) || this.checkSolvedColAt(x, y) || this.checkSolvedDiaDescAt(x, y) || this.checkSolvedDiaAscAt(x, y)) {return true}
		else {return false}
	}
	
	checkSolvedRowAt(x, y){
		var isSetRed = null
		var isSolved = null
		for (let i = 0; i < 4; i++){
			if ((x - i) <= 3 && (x - i) >= 0){
				isSetRed = null
				isSolved = true
				for (let j = 0; j < 4; j++){
					if (!(this.board[y][x - i + j].isPopulated)){
						isSolved = false
						break
					}
					else if (isSetRed == null){
						isSetRed = this.board[y][x - i + j].isRed
					}
					else if (isSetRed != this.board[y][x - i + j].isRed){
						isSolved = false
						break
					}
				}
				if (isSolved){return true}
			}
		}
		return false
	}
	
	checkSolvedColAt(x, y){
		var isSetRed = null
		var isSolved = null
		for (let i = 0; i < 4; i++){
			if ((y - i) <= 2 && (y - i) >= 0){
				isSetRed = null
				isSolved = true
				for (let j = 0; j < 4; j++){
					if (!(this.board[y - i + j][x].isPopulated)){
						isSolved = false
						break
					}
					else if (isSetRed == null){
						isSetRed = this.board[y - i + j][x].isRed
					}
					else if (isSetRed != this.board[y - i + j][x].isRed){
						isSolved = false
						break
					}
				}
				if (isSolved){return true}
			}
		}
		return false
	}
	
	checkSolvedDiaDescAt(x, y){
		var isSetRed = null
		var isSolved = null
		for (let i = 0; i < 4; i++){
			if ((x - i) <= 3 && (x - i) >= 0 && (y - i) <= 2 && (y - i) >= 0){
				var isSetRed = null
				var isSolved = true
				for (let j = 0; j < 4; j++){
					if (!(this.board[y - i + j][x - i + j].isPopulated)){
						isSolved = false
						break
					}
					else if (isSetRed == null){
						isSetRed = this.board[y - i + j][x - i + j].isRed
					}
					else if (isSetRed != this.board[y - i + j][x - i + j].isRed){
						isSolved = false
						break
					}
				}
				if (isSolved){return true}
			}
		}
		return false
	}
	
	checkSolvedDiaAscAt(x, y){
		var isSetRed = null
		var isSolved = null
		for (let i = 0; i < 4; i++){
			if ((x - i) <= 3 && (x - i) >= 0 && (y + i) <= 5 && (y + i) >= 3){
				var isSetRed = null
				var isSolved = true
				for (let j = 0; j < 4; j++){
					if (!(this.board[y + i - j][x - i + j].isPopulated)){
						isSolved = false
						break
					}
					else if (isSetRed == null){
						isSetRed = this.board[y + i - j][x - i + j].isRed
					}
					else if (isSetRed != this.board[y + i - j][x - i + j].isRed){
						isSolved = false
						break
					}
				}
				if (isSolved){return true}
			}
		}
		return false
	}
	
	boardFull(){
		for (let i = 0; i < this.board[0].length; i++){
			if (!(this.board[0][i].isPopulated)){return false}
		}
		return true
	}
	
	getScore(){
		return this.scoreList.totalScore
	}
}

class scoreList{//lists scores for each board and contains methods to populate those lists
	constructor(){
		this.horizontal = {red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}//remove "score"s?
		this.vertical = {red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}
		this.diagAsc = {red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}
		this.diagDesc = {red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}
		this.totalScore = 0
	}
	
	makeLists(inBoard){
		this.setHorizontal(inBoard)
		this.setVertical(inBoard)
		this.setDiagAsc(inBoard)
		this.setDiagDesc(inBoard)
	}
	
	setHorizontal(inBoard){
		var firstRed = null
		var addToList = null
		var count = null
		for (let i = 0; i < 6; i++){
			for (let j = 0; j < 4; j++){// for each square, track first colour encountered, if other colour is found, break and repeat with next square, otherwise increase a counter which decides score to be added
				addToList = true
				if (inBoard[i][j].isPopulated){
					firstRed = inBoard[i][j].isRed
					count = 1
				}
				else {
					firstRed = null
					count = 0
				}
				for (let k = 1; k < 4; k++){
					if (firstRed != null && inBoard[i][j + k].isPopulated){
						if (firstRed != inBoard[i][j + k].isRed){
							addToList = false
							break
						}
						else {count++}
					}
					else if (inBoard[i][j + k].isPopulated){
						firstRed = inBoard[i][j + k].isRed
						count++
					}
				}
				if (addToList && firstRed != null){this.addEntry(this.horizontal, firstRed, count, i, j)}
			}
		}
	}
	
	setVertical(inBoard){
		var firstRed = null
		var addToList = null
		var count = null
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < 7; j++){// for each square, track first colour encountered, if other colour is found, break and repeat with next square, otherwise increase a counter which decides score to be added
				addToList = true
				if (inBoard[i][j].isPopulated){
					firstRed = inBoard[i][j].isRed
					count = 1
				}
				else {
					firstRed = null
					count = 0
				}
				for (let k = 1; k < 4; k++){
					if (firstRed != null && inBoard[i + k][j].isPopulated){
						if (firstRed != inBoard[i + k][j].isRed){
							addToList = false
							break
						}
						else {count++}
					}
					else if (inBoard[i + k][j].isPopulated){
						firstRed = inBoard[i + k][j].isRed
						count++
					}
				}
				if (addToList){this.addEntry(this.vertical, firstRed, count, i, j)}
			}
		}
	}
	
	setDiagAsc(inBoard){
		var firstRed = null
		var addToList = null
		var count = null
		for (let i = 3; i < 6; i++){
			for (let j = 0; j < 4; j++){// for each square, track first colour encountered, if other colour is found, break and repeat with next square, otherwise increase a counter which decides score to be added
				addToList = true
				if (inBoard[i][j].isPopulated){
					firstRed = inBoard[i][j].isRed
					count = 1
				}
				else {
					firstRed = null
					count = 0
				}
				for (let k = 1; k < 4; k++){
					if (firstRed != null && inBoard[i - k][j + k].isPopulated){
						if (firstRed != inBoard[i - k][j + k].isRed){
							addToList = false
							break
						}
						else {count++}
					}
					else if (inBoard[i - k][j + k].isPopulated){
						firstRed = inBoard[i - k][j + k].isRed
						count++
					}
				}
				if (addToList){this.addEntry(this.diagAsc, firstRed, count, i, j)}
			}
		}
	}
	
	setDiagDesc(inBoard){
		var firstRed = null
		var addToList = null
		var count = null
		for (let i = 0; i < 3; i++){
			for (let j = 0; j < 4; j++){// for each square, track first colour encountered, if other colour is found, break and repeat with next square, otherwise increase a counter which decides score to be added
				addToList = true
				if (inBoard[i][j].isPopulated){
					firstRed = inBoard[i][j].isRed
					count = 1
				}
				else {
					firstRed = null
					count = 0
				}
				for (let k = 1; k < 4; k++){
					if (firstRed != null && inBoard[i + k][j + k].isPopulated){
						if (firstRed != inBoard[i + k][j + k].isRed){
							addToList = false
							break
						}
						else {count++}
					}
					else if (inBoard[i + k][j + k].isPopulated){
						firstRed = inBoard[i + k][j + k].isRed
						count++
					}
				}
				if (addToList){this.addEntry(this.diagDesc, firstRed, count, i, j)}
			}
		}
	}
	
	addEntry(directionList, firstRed, count, i, j){
		if (firstRed){
			if (count == 1){
				directionList["red"]["lists"]["ones"].push([i, j])
			}
			else if (count == 2){
				directionList["red"]["lists"]["twos"].push([i, j])
			}
			else if (count == 3){
				directionList["red"]["lists"]["threes"].push([i, j])
			}
			else if (count == 4){
				directionList["red"]["lists"]["fours"].push([i, j])
			}
		}
			else {
			if (count == 1){
				directionList["yellow"]["lists"]["ones"].push([i, j])
			}
			else if (count == 2){
				directionList["yellow"]["lists"]["twos"].push([i, j])
			}
			else if (count == 3){
				directionList["yellow"]["lists"]["threes"].push([i, j])
			}
			else if (count == 4){
				directionList["yellow"]["lists"]["fours"].push([i, j])
			}
		}
	}
	
	setScores(){
		this.totalScore = 0
		this.setScoreIndividual(this.horizontal["red"]["lists"], true)
		this.setScoreIndividual(this.vertical["red"]["lists"], true)
		this.setScoreIndividual(this.diagAsc["red"]["lists"], true)
		this.setScoreIndividual(this.diagDesc["red"]["lists"], true)
		this.setScoreIndividual(this.horizontal["yellow"]["lists"], false)
		this.setScoreIndividual(this.vertical["yellow"]["lists"], false)
		this.setScoreIndividual(this.diagAsc["yellow"]["lists"], false)
		this.setScoreIndividual(this.diagDesc["yellow"]["lists"], false)
	}
	
	setScoreIndividual(inJsObj, isRed){
		var incrementor = 0
		for (var list in inJsObj){
			if (inJsObj.hasOwnProperty(list)){
				if (list == "ones"){incrementor = 1}
				else if (list == "twos"){incrementor = 2}
				else if (list == "threes"){incrementor = 4}
				else if (list == "fours"){incrementor = 100}//max
				if (isRed){this.totalScore += incrementor * inJsObj[list].length}
				else {this.totalScore -= incrementor * inJsObj[list].length}
			}
		}
	}
	
	setTotal(){//sets score from red's perspective
		this.totalScore = 0
		this.totalScore += this.horizontal["red"]["score"] - this.horizontal["yellow"]["score"]
		this.totalScore += this.vertical["red"]["score"] - this.vertical["yellow"]["score"]
		this.totalScore += this.diagAsc["red"]["score"] - this.diagAsc["yellow"]["score"]
		this.totalScore += this.diagDesc["red"]["score"] - this.diagDesc["yellow"]["score"]
	}
	
	getSetTotal(inBoard){
		if (JSON.stringify(this.horizontal) == JSON.stringify({red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}) && JSON.stringify(this.vertical) == JSON.stringify({red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}) && JSON.stringify(this.diagAsc) == JSON.stringify({red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}}) && JSON.stringify(this.diagDesc) == JSON.stringify({red: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}, yellow: {lists: {ones: [], twos: [], threes: [], fours: []}, score: 0}})){this.makeLists(inBoard)}//lists are empty
		this.setScores()
		return this.totalScore
	}
}

class boardSquare{//squares for board indicating if the square is populated and what it is populated with
	constructor(isPopulated, isRed){
		if (typeof(isPopulated) == "undefined"){isPopulated = false}
		if (typeof(isRed) == "undefined"){isRed = false}
		this.isPopulated = isPopulated
		this.isRed = isRed
	}
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function beginGame(){
	var difficulty = parseInt($("#difficultySetting").val())
	if (difficulty < 1 || difficulty > 7 || difficulty % 1 != 0){
		alert("Please choose a difficulty between 1 and 7.")
		return false
	}
	else{
		$("#difficultySetting").prop("disabled", true)
		$(".topRow").each(function(){
			$(this).prop("disabled", false)
		})
		$("#submitMove").prop("disabled", false)
		$("#userFirst").prop("disabled", true)
		var resetButton = $("#resetButton")
		$(resetButton).off("click", beginGame)
		$(resetButton).on("click", resetBoard)
		$(resetButton).prop("value", "New Game?")
		if (!($("#userFirst").is(".active"))){
			compMove(difficulty)
		}
	}
}

$("#resetButton").on("click", beginGame)