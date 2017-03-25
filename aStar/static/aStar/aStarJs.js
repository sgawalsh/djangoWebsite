function drawGrid(){//loads session storage 2d array "grid" and draws table of radio buttons of same dimensions
	var grid = JSON.parse(sessionStorage.getItem("grid"))
	var gridTable = document.getElementById("gridTable")
	
	for (let i = 0; i < grid.length; i++){
		var tr = document.createElement("tr")
		for (let j = 0; j < grid[i].length; j++){
			var td = document.createElement("td")
			td.id = "x" + j + ", y" + i + "div"
			var tdDiv = document.createElement("div")
			tdDiv.className = "radio"
			tdDiv.innerHTML = "<center><input type = 'radio' name = 'optradio'/ id='x" + j + ", y" + i + "' style = 'position: static'></center>"
			td.appendChild(tdDiv)
			tr.appendChild(td)
		}
		gridTable.appendChild(tr)
	}
}

function saveGrid(){//takes user input and creates 2d array of cells and saves to sessionStorage
	var rowNum = parseInt(document.getElementById("rowNum").value)
	var colNum = parseInt(document.getElementById("colNum").value)
	var grid = []
	
	for (let i = 0; i < rowNum; i++){
		grid.push([])
		for (let j = 0; j < colNum; j++){
			grid[i].push(new cell(j, i))
		}
	}
	sessionStorage.setItem("grid", JSON.stringify(grid))
	sessionStorage.setItem("successPath", JSON.stringify([]))
}

class cell {//cell class, coordinates, parent values, hgfvalues
	constructor(x, y){
		this.x = x
		this.y = y
		this.isStart = false
		this.isEnd = false
		this.isWall = false
		this.gVal = 0
		this.hVal = 0
		this.fVal = 0
		this.par = null
	}
}

function createGrid(){//draws and saves grid, changes stepButton to Set start point
	saveGrid()
	drawGrid()
	
	var stepButton = document.getElementById("stepButton")
	stepButton.value = "Set Start Point"
	stepButton.onclick = function(){findChecked(findCheckedStart, true, false)}
}

function findChecked(varFn, needsSelection, needsSave){// loops over each element in the grid, performs variable funtion 'varFn' on each iteration
	var grid = JSON.parse(sessionStorage.getItem("grid"))
	for (let i = 0; i < grid.length; i++){
		for (let j = 0; j < grid[i].length; j++){
			if (varFn(j, i, grid)){return}
		}
	}
	if (needsSelection){alert("Please select a node to proceed.")}
	else if (needsSave){sessionStorage.setItem("grid", JSON.stringify(grid))}
}

function setStartPoint(j, i, grid){//saves start point to sessionStorage, draws 'O' denoting point on table, updates stepButton to "Set End Point"
	sessionStorage.setItem("start", JSON.stringify([i, j]))
	grid[i][j].isStart = true
	var start = document.getElementById("x" + j + ", y" + i)
	start.disabled = true
	start.checked = false
	start.parentNode.parentNode.parentNode.className = "warning"
	stepButton.value = "Set Target Point"
	stepButton.onclick = function(){findChecked(findCheckedEnd, true, false)}
	sessionStorage.setItem("grid", JSON.stringify(grid))
}

function findCheckedStart(j, i, grid){//varFn that checks if radio button is checked and calls "setStartPoint" if so
	if (document.getElementById("x" + j + ", y" + i).checked){
		setStartPoint(j, i, grid)
		return true
	}
}

function findCheckedEnd(j, i, grid){
	try{
		if (document.getElementById("x" + j + ", y" + i).checked && document.getElementById("x" + j + ", y" + i).disabled == false){
			setEndPoint(j, i, grid)
			return true
		}
	}
	catch(e){}
}

function setEndPoint(j, i, grid){
	sessionStorage.setItem("end", JSON.stringify([i, j]))
	grid[i][j].isEnd = true
	var end = document.getElementById("x" + j + ", y" + i)
	end.disabled = true
	end.checked = false
	end.parentNode.parentNode.parentNode.className = "danger"
	stepButton.value = "Set Walls"
	stepButton.onclick = setWallsFindPath
	sessionStorage.setItem("grid", JSON.stringify(grid))
	findChecked(removeNames, false, false)
}

function removeNames(j, i){//removes radio button names, changes to checkboxes
	try{
		document.getElementById("x" + j + ", y" + i).removeAttribute("name")
		document.getElementById("x" + j + ", y" + i).type = "checkbox"
	}
	catch(e){}
}

function setWalls(j, i, grid){//sets cell wall status to true or false depending on checked status
	try{
		if (document.getElementById("x" + j + ", y" + i).checked){grid[i][j].isWall = true}
		else {grid[i][j].isWall = false}
	}
	catch(e){}
}

function setWallsFindPath(){//sets walls, Hvalues on each cell, and calls recursive a* algorithm
	findChecked(setWalls, false, true)
	var grid = JSON.parse(sessionStorage.getItem("grid"))
	assignHVals(grid)
	var startCoord = JSON.parse(sessionStorage.getItem("start"))
	var endCoord = JSON.parse(sessionStorage.getItem("end"))
	if (findPath([grid[startCoord[0]][startCoord[1]]], [], grid[endCoord[0]][endCoord[1]], grid)){
		findSuccessPath(grid, endCoord)
	}
	else{
		var successPath = JSON.parse(sessionStorage.getItem("successPath"))
		for (let i = 0; i < successPath.length; i++){document.getElementById("x" + successPath[i][0] + ", y" + successPath[i][1] + "div").className = ""}
	}
	sessionStorage.setItem("grid", JSON.stringify(grid))
}

function findSuccessPath(grid, endCoord){
	var currentCell = grid[endCoord[0]][endCoord[1]]
	var pathArray = []
	
	while (currentCell != null){
		pathArray.push([currentCell.x, currentCell.y])
		currentCell = currentCell.par
	}
	
	drawSuccessPath(grid, pathArray)
}

function drawSuccessPath(grid, pathArray){//changes class of divs in array to 'success', removes class name from old path
	var successPath = JSON.parse(sessionStorage.getItem("successPath"))
	for (let i = 0; i < successPath.length; i++){document.getElementById("x" + successPath[i][0] + ", y" + successPath[i][1] + "div").className = ""}
	for (let i = 0; i < pathArray.length; i++){document.getElementById("x" + pathArray[i][0] + ", y" + pathArray[i][1] + "div").className = "success"}
	sessionStorage.setItem("successPath", JSON.stringify(pathArray))
}

function assignHVals(grid){//assigns Hvalues according to manhattan method
	var targCoord = JSON.parse(sessionStorage.getItem("end"))
	
	for (let i = 0; i < grid.length; i++){
		for (let j = 0; j < grid[i].length; j++){
			grid[i][j].hVal = 10 * (Math.abs(j - targCoord[1]) + Math.abs(i - targCoord[0]))
			grid[i][j].fVal = grid[i][j].hVal
		}
	}
}

function indexOfMinFVal(arr) {//finds index of array element with smallest fValue
	var min = arr[0].fVal
	var minIndex = 0

	for (var i = 1; i < arr.length; i++){
		if (arr[i].fVal < min){
			minIndex = i
			min = arr[i].fVal
		}
		else if (arr[i].fVal == min){
			if (arr[i].hVal > arr[minIndex].hVal){continue}//lower hValue chosen for tiebreak
			else{minIndex = i}
		}
	}
	return minIndex;
}

function findPath(openList, closedList, target, grid){
	if (openList.length == 0){//no solution
		return false
	}
	var index = indexOfMinFVal(openList)
	var currentCell = openList.splice(index, 1)[0]
	closedList.push(currentCell)
	if (currentCell == target){
		return true
	}
	
	for (let i = -1; i <= 1; i++){
		for (let j = -1; j <= 1; j++){
			var newY = currentCell.y + i
			var newX = currentCell.x + j
			if (newY >=0 && newY < grid.length && newX >=0 && newX < grid[newY].length && (!(grid[newY][newX].isWall)) && (!(i == 0 && j == 0)) && closedList.indexOf(grid[newY][newX]) == -1){
				var newCell = grid[newY][newX]
				if (openList.indexOf(newCell) == -1){
					if ((newY == currentCell.y) != (newX == currentCell.x)){
						newCell.gVal = currentCell.gVal + 10
					}
					else {newCell.gVal = currentCell.gVal + 14}
					newCell.par = currentCell
					newCell.fVal = newCell.gVal + newCell.hVal
					openList.push(newCell)
				}
				else{
					var potG = 0
					if ((newY == currentCell.y) != (newX == currentCell.x)){
						potG = currentCell.gVal + 10
					}
					else {potG = currentCell.gVal + 14}
					if (potG <= newCell.gVal){
						newCell.gVal = potG
						newCell.parent = currentCell
						newCell.fVal = newCell.gVal + newCell.hVal
					}
				}
			}
		}
	}
	return findPath(openList, closedList, target, grid)
}

/*
1) Add the starting square (or node) to the open list.

2) Repeat the following:

a) Look for the lowest F cost square on the open list. We refer to this as the current square.

b) Switch it to the closed list.

c) For each of the 8 squares adjacent to this current square …

If it is not walkable or if it is on the closed list, ignore it. Otherwise do the following.           

If it isn’t on the open list, add it to the open list. Make the current square the parent of this square. Record the F, G, and H costs of the square. 

If it is on the open list already, check to see if this path to that square is better, using G cost as the measure. A lower G cost means that this is a better path. If so, change the parent of the square to the current square, and recalculate the G and F scores of the square. If you are keeping your open list sorted by F score, you may need to resort the list to account for the change.

d) Stop when you:

Add the target square to the closed list, in which case the path has been found (see note below), or
Fail to find the target square, and the open list is empty. In this case, there is no path.   
3) Save the path. Working backwards from the target square, go from each square to its parent square until you reach the starting square. That is your path. 

*/