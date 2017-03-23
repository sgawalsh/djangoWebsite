sessionStorage.setItem("bst", JSON.stringify([]))

function addNumber(value){
    myTree = JSON.parse(sessionStorage.getItem("bst"))
	
	//travel through tree comparing values, if larger go right, smaller left. extend array with null elements if necessary
	bstCheck(0, myTree, value)
	printTree(myTree)
	calcAverageNodeAccesses()
}

function bstCheck(index, inArray, value){//traverses to appropriate node, creating it if it does not exist, and adds selected value to tree
	if (index >= inArray.length){// index is out of bounds
		//set all new values to null, call fn recursively
		for (let i = inArray.length; i <= index; i++){
			inArray.push(null)
		}
		bstCheck(index, inArray, value)
	}
	else{
		if (inArray[index] == null){
			inArray[index] = value
			sessionStorage.setItem("bst", JSON.stringify(inArray))
			}//spot is empty
		else if (value >= inArray[index]){//if value is greater or equal than node, go right
			bstCheck(2 * index + 2, inArray, value)
		}
		else if (value <= inArray[index]){//if value is less than node, go left
			bstCheck((2 * index + 1), inArray, value)
		}
	}
}

function addRandom(){//selects random number between -100 - 100 and adds to tree
	var randVal = Math.round(Math.random() * 200 - 100)
	document.getElementById("inValue").value = randVal
	addNumber(randVal)
}

function bstSearch(searchVal, index, moves, bstTree){//searches tree for selected value
	if (bstTree[index] == null || typeof(bstTree[index]) == "undefined"){
		alert("Value found to not be present after " + moves + " moves.")
	}
	else if (searchVal > bstTree[index]){
		bstSearch(searchVal, 2 * index + 2, moves + 1, bstTree)
	}
	else if (searchVal < bstTree[index]){
		bstSearch(searchVal, 2 * index + 1, moves + 1, bstTree)
	}
	else if (searchVal == bstTree[index]){
		alert("Found " + searchVal + " after " + moves + " moves.")
	}
}

function quietBstSearch(searchVal, index, bstTree){
	if (bstTree[index] == null || typeof(bstTree[index]) == "undefined"){
		return null
	}
	else if (searchVal > bstTree[index]){
		return quietBstSearch(searchVal, 2 * index + 2, bstTree)
	}
	else if (searchVal < bstTree[index]){
		return quietBstSearch(searchVal, 2 * index + 1, bstTree)
	}
	else if (searchVal == bstTree[index]){
		return index
	}
}

function balanceTree(index, tree){
	var rightDepth = getDepth(2 * index + 2, tree, 0)
	var leftDepth = getDepth(2 * index + 1, tree, 0)
	
	if (Math.abs(rightDepth - leftDepth) >= 2){//compare depth of each branch
		if (rightDepth > leftDepth){
			if (!balanceTree(2 * index + 2, tree)){//check depth of next node recursively
				if (getDepth(4 * index + 5, tree, 0) > getDepth(4 * index + 6, tree, 0)){tree = fixRightLeft(2 * index + 2, tree)}
				rotateLeft(index, tree)
				return true
			}
		}
		else {
			if (!balanceTree(2 * index + 1, tree)){
				if (getDepth(4 * index + 3, tree, 0) < getDepth(4 * index + 4, tree, 0)){tree = fixLeftRight(2 * index + 1, tree)}
				rotateRight(index, tree)
				return true
			}
		}
	}
	else{return false}//return false if length difference < 2, level above rotates
	return true
}

function balanceTree2(index, tree){//if blank, return. call on recursively children and attempt to balance
	if (tree[index] == null || typeof(tree[index]) == "undefined"){return}
	
	balanceTree2(2 * index + 2, tree)
	balanceTree2(2 * index + 1, tree)
	
	var rightDepth = getDepth(2 * index + 2, tree, 0)
	var leftDepth = getDepth(2 * index + 1, tree, 0)
	
	if (Math.abs(rightDepth - leftDepth) >= 2){//compare depth of each branch
		if(rightDepth > leftDepth){
			if (getDepth(4 * index + 5, tree, 0) > getDepth(4 * index + 6, tree, 0)){fixRightLeft(2 * index + 2, tree)}
			rotateLeft2(index, tree)
			return true
		}
		else{
			if (getDepth(4 * index + 3, tree, 0) < getDepth(4 * index + 4, tree, 0)){fixLeftRight(2 * index + 1, tree)}
			rotateRight2(index, tree)
			return true
		}
	}
	else{return false}//return false if length difference < 2, level above rotates
	return true
}

function getDepth(index, bstTree, depth){//returns depth of branch
	if (bstTree[index] == null || typeof(bstTree[index]) == "undefined"){
		return depth
	}
	else {
		depth += 1
		return Math.max(getDepth(2 * index + 2, bstTree, Number(depth)), getDepth(2 * index + 1, bstTree, Number(depth)))
	}
}

function fixRightLeft(index, newTree){//push right down, give left right to right left, pull left left up
	var oldTree = newTree.slice(0)
	
	var newList = []
	
	shiftBranch(2 * index + 2, 4 * index + 6, newTree, oldTree, newList)
	shiftBranch(4 * index + 4, 4 * index + 5, newTree, oldTree, newList)
	newTree[2 * index + 1] = null
	shiftBranch(4 * index + 3, 2 * index + 1, newTree, oldTree, newList)
	
	newTree[index] = oldTree[2 * index + 1]
	newTree[2 * index + 2] = oldTree[index]
}

function fixLeftRight(index, newTree){
	var oldTree = newTree.slice(0)
	
	var newList = []
	
	shiftBranch(2 * index + 1, 4 * index + 3, newTree, oldTree, newList)
	shiftBranch(4 * index + 5, 4 * index + 4, newTree, oldTree, newList)
	newTree[2 * index + 2] = null
	shiftBranch(4 * index + 6, 2 * index + 2, newTree, oldTree, newList)
	
	newTree[index] = oldTree[2 * index + 2]
	newTree[2 * index + 1] = oldTree[index]
}

function rotateLeft(index, oldTree){//push middle left, pull up right, give left of right to left
	var newTree = oldTree.slice(0)
	
	shiftBranch(2 * index + 1, 4 * index + 3, oldTree, newTree)//push middle left
	shiftBranch(4 * index + 6, 2 * index + 2, oldTree, newTree)//pull up right
	shiftBranch(4 * index + 5, 4 * index + 4, oldTree, newTree)// give left of right to left
	
	newTree[2 * index + 1] = oldTree[index]//move old root
	newTree[index] = oldTree[2 * index + 2]// set new root
	
	printTree(newTree)
	sessionStorage.setItem("bst", JSON.stringify(newTree))
}


function rotateRight(index, oldTree){//push middle right, pull up left, give right of left to right
	var newTree = oldTree.slice(0)
	
	shiftBranch(2 * index + 2, 4 * index + 6, oldTree, newTree)
	shiftBranch(4 * index + 3, 2 * index + 1, oldTree, newTree)
	shiftBranch(4 * index + 4, 4 * index + 5, oldTree, newTree)
	
	newTree[2 * index + 2] = oldTree[index]
	newTree[index] = oldTree[2 * index + 1]
	
	printTree(newTree)
	sessionStorage.setItem("bst", JSON.stringify(newTree))
}

function rotateLeft2(index, newTree){//push middle left, pull up right, give left of right to left
	var oldTree = newTree.slice(0)
	
	var newList = []
	
	shiftBranch(2 * index + 1, 4 * index + 3, newTree, oldTree, newList)//push middle left
	shiftBranch(4 * index + 6, 2 * index + 2, newTree, oldTree, newList)//pull up right
	shiftBranch(4 * index + 5, 4 * index + 4, newTree, oldTree, newList)// give left of right to left
	
	newTree[2 * index + 1] = oldTree[index]//move old root
	newTree[index] = oldTree[2 * index + 2]// set new root
	
	printTree(newTree)
	sessionStorage.setItem("bst", JSON.stringify(newTree))
}


function rotateRight2(index, newTree){//push middle right, pull up left, give right of left to right
	var oldTree = newTree.slice(0)
	
	var newList = []
	
	shiftBranch(2 * index + 2, 4 * index + 6, newTree, oldTree, newList)
	shiftBranch(4 * index + 3, 2 * index + 1, newTree, oldTree, newList)
	shiftBranch(4 * index + 4, 4 * index + 5, newTree, oldTree, newList)
	
	newTree[2 * index + 2] = oldTree[index]
	newTree[index] = oldTree[2 * index + 1]
	
	printTree(newTree)
	sessionStorage.setItem("bst", JSON.stringify(newTree))
}

function shiftBranch(index, shiftIndex, newTree, oldTree, newList){//copies a branch from oldTree to newTree
	if (!(oldTree[index] == null || typeof(oldTree[index]) == "undefined")){
		if (typeof(newTree[shiftIndex]) == "undefined"){
			for (let i = newTree.length; i <= shiftIndex; i++){
				newTree.push(null)
			}
		}
		newTree[shiftIndex] = oldTree[index]
		newList.push(shiftIndex)
		if (newList.indexOf(index) < 0){newTree[index] = null}//only clear places not previously written to
		shiftBranch(2 * index + 2, 2 * shiftIndex + 2, newTree, oldTree, newList)
		shiftBranch(2 * index + 1, 2 * shiftIndex + 1, newTree, oldTree, newList)
	}
}

function calcAverageNodeAccesses(){//calculates average cost to access nodes on tree and writes value to page
	var accessArray = []
	var tree = JSON.parse(sessionStorage.getItem("bst"))
	
	calcAverageNodeAccessesRecursor(0, 0, accessArray, tree)
	
	if (accessArray.length > 0){
		var sum = 0
		for (let i = 0; i < accessArray.length; i++){sum += accessArray[i]}
		document.getElementById("averageNodeAccesses").value = (sum / accessArray.length).toString().slice(0, 4)
	}
}

function calcAverageNodeAccessesRecursor(index, depth, accessArray, tree){//recursive function traversing tree and adding access costs to array
	if (tree[index] == null || typeof(tree[index]) == "undefined"){return}//skip unoccupied nodes
	else{
		depth +=1
		accessArray.push(depth)
		calcAverageNodeAccessesRecursor(2 * index + 2, Number(depth), accessArray, tree)
		calcAverageNodeAccessesRecursor(2 * index + 1, Number(depth), accessArray, tree)
	}
}

function balanceCaller(){
	balanceTree2(0, JSON.parse(sessionStorage.getItem('bst')));
	calcAverageNodeAccesses();
}

function delNode(index, tree){
	if ((typeof(tree[2 * index + 2]) == "undefined" || tree[2 * index + 2] == null) && (typeof(tree[2 * index + 1]) == "undefined" || tree[2 * index + 1] == null)){//no children, delete node
		tree[index] = null
	}
	else if(typeof(tree[2 * index + 2]) == "undefined" || tree[2 * index + 2] == null){//1 left child, replace node with child and move branch
		shiftBranch(2 * index + 1, index, tree, tree.slice(0), [])
	}
	else if (typeof(tree[2 * index + 1]) == "undefined" || tree[2 * index + 1] == null){// 1 right child
		shiftBranch(2 * index + 2, index, tree, tree.slice(0), [])
	}
	else{//two children, find highest predecessor, and replace with that value, call recursively on highestPred
		var highestPred = findHighestPred(index, tree)
		tree[index] = tree[highestPred]
		delNode(highestPred, tree)
	}
}

function findHighestPred(index, tree){//returns index of highest predecessor value
	index = 2 * index + 1
	while (!(typeof(tree[2 * index + 2]) == "undefined" || tree[2 * index + 2] == null)){
		index = 2 * index + 2
	}
	return index
}

function delValue(){
	var myTree = JSON.parse(sessionStorage.getItem("bst"))
	var searchIndex = quietBstSearch(parseInt(document.getElementById("inValue").value), 0, myTree)
	
	if (searchIndex == null){
		alert("Value not present in tree")
		return
	}
	else{delNode(searchIndex, myTree)}
	printTree(myTree)
	sessionStorage.setItem("bst", JSON.stringify(myTree))
	calcAverageNodeAccesses()
}