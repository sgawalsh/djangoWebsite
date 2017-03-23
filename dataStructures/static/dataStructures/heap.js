sessionStorage.setItem("heapArray", JSON.stringify([]))

function insertNode(inNode){
	var heapArray = JSON.parse(sessionStorage.getItem("heapArray"))
	heapArray.push(inNode)//insert node to bottom of heap
	bubbleUp(heapArray, heapArray.length - 1)//bubble up node
	printTree(heapArray)
	sessionStorage.setItem("heapArray", JSON.stringify(heapArray))
}

function bubbleUp(heap, index){//finds parent index, checks if value is less than self, switches places if so
	var parIndex = null
	if(index % 2 == 0){
		parIndex = (index - 2) / 2
	}
	else{parIndex = (index - 1) / 2}
	
	if(parIndex >= 0){
		if (heap[index] > heap[parIndex]){
			var buffer = heap[index]
			heap[index] = heap[parIndex]
			heap[parIndex] = buffer
			bubbleUp(heap, parIndex)
		}
	}
}

function addRandom(){//selects random number between -100 - 100 and adds to heap
	var randVal = Math.round(Math.random() * 200 - 100)
	document.getElementById("inValue").value = randVal
	insertNode(randVal)
}

function extractRoot(){//sets last element to root and bubbles down to appropriate spot
	var heapArray = JSON.parse(sessionStorage.getItem("heapArray"))
	var buffer = heapArray.pop()
	if (heapArray.length >= 1){
		heapArray[0] = buffer//set last value to root
		bubbleDown(heapArray, 0)//bubble down new root
	}
	printTree(heapArray)
	sessionStorage.setItem("heapArray", JSON.stringify(heapArray))	
}

function bubbleDown(heapArray, index){
	var largest = index
	
	if (heapArray[index] < heapArray[2 * index + 1] && !(typeof(heapArray[2 * index + 1]) == "undefined")){
		largest = 2 * index + 1
	}
	if (heapArray[largest] < heapArray[2 * index + 2] && !(typeof(heapArray[2 * index + 2]) == "undefined")){
		largest = 2 * index + 2
	}
	
	if (largest != index){
		var buffer = heapArray[largest]
		heapArray[largest] = heapArray[index]
		heapArray[index] = buffer
		bubbleDown(heapArray, largest)
	}
}

function findNode(index, heap, searchVal){//checks if node doesn't exist or value is less than searchVal, returns void if so, checks if value is present and returns index if true, otherwise calls self recursively on children
	if (typeof(heap[index]) == "undefined" || heap[index] < searchVal){return}
	else if (heap[index] == searchVal){return index}
	else{
		var retVal = undefined
		retVal = findNode(2 * index + 1, heap, searchVal)
		if (typeof(retVal) != "undefined"){return retVal}
		else return findNode(2 * index + 2, heap, searchVal)
	}
}

function extractValue(){//searches for index of value, if found pops last element array and heapifies
	var heapArray = JSON.parse(sessionStorage.getItem("heapArray"))
	var index = findNode(0, heapArray, (parseInt(document.getElementById('inValue').value)))
	if (typeof(index) == "undefined"){alert("Value not present.")}//value not found
	else {
		var buffer = heapArray.pop()
		if (heapArray.length >= 1 && index < heapArray.length){
			heapArray[index] = buffer//set last value to extracted node position
			var parentIndex = 0
			if (index % 2 == 1){parentIndex = (index - 1) / 2}
			else if(index > 0){parentIndex = (index - 2) / 2}
			if (heapArray[index] > heapArray[parentIndex]){bubbleUp(heapArray, index)}//bubble value up if greater than parent
			else bubbleDown(heapArray, index)//otherwise bubble down
		}
		printTree(heapArray)
		sessionStorage.setItem("heapArray", JSON.stringify(heapArray))
	}
}