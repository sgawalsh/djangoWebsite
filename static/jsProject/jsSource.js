function generateArray(){//reads sortChoice and length chosen and generates randomized array, then passes values to 'displayArrayAsTable'
    
    var arrayLength = parseInt(document.getElementById('length').value)
    var sortChoice = document.getElementById('sortChoice').value
    var myArray = []
    var myTbody = document.getElementById("jsTable")
    var rowCount = parseInt(myTbody.getAttribute("rowcount"))
    rowCount++
    myTbody.setAttribute("rowcount", rowCount.toString())
    
    for (var i = 0; i < parseInt(arrayLength); i ++){
        myArray.push(Math.floor((Math.random() * 100) + 1))
        }

    var table = displayArrayAsTable(myArray, (rowCount - 1).toString(), sortChoice);
}


function quickSort(inArray){// takes array and performs quicksort iteration, returns array along with positions of unsorted values
    var less = []
    var more = []
    var pivArray = []
	
    if (inArray.length > 1){
        var pivot = inArray.pop()
        for (var i = 0; i < inArray.length; i++){
			if (inArray[i] < pivot){
				less.push(inArray[i])
					}
			else if (inArray[i] > pivot){
				more.push(inArray[i])
					}
            else{
                pivArray.push(inArray[i])
            }
			}
        pivArray.push(pivot)
        }
        //return new array along with points to start from
    return [less.concat(pivArray).concat(more), [less.length, more.length]]
}


function displayArrayAsTable(inArray, rowNum, sortChoice) {// creates row, and td data, assigns any needed tags for the sortChoice

    var array = inArray || []

    if ( array.length < 1 ){return;}

    var table = document.getElementById('jsTable');
    var row = document.createElement('tr');
    row.id = 'rowNum' + rowNum

    //create length, issorted, and sortchoice tags and assign values
    createAssignSetNode(row, 'length', array.length)
    createAssignSetNode(row, 'issorted', false)
    createAssignSetNode(row, 'sortChoice', sortChoice)

    //add 'delete' button to row
    button = document.createElement('input')
    button.id = 'deleteRow' + rowNum
    button.className = "btn btn-default"
    button.type = 'button'
    button.value = "Delete Row"
    button.addEventListener('click', function(){deleteRow(row);}, false);
    button.style.cssFloat = "left"
    row.appendChild(button)

    var button = document.createElement('input')
    button.id = "clickMe" + rowNum
    button.type = "button"
    button.className = "btn btn-default"
    button.value = "Iterate Array"
    if (sortChoice == "QuickSort"){//Assigns quicksort function and 'division' tag to row
        button.addEventListener("click", function() {qsiterateArray(row.id);}, false);
        button.style.cssFloat = "left"
        row.appendChild(button)
        createAssignSetNode(row, 'divisions', "[[0," + (array.length - 1) + "]]")
        makeSpeedButton(row, speedQuickCall)
        addArrayToRow(row, array, 0)
        setTdClass(row, 0, inArray.length, "warning")
    }
    else if (sortChoice == "BogoSort"){//Assigns bogosort function
        button.addEventListener("click", function() {bogoSort(row.id);}, false);
        button.style.cssFloat = "left"
        row.appendChild(button)
        addArrayToRow(row, array, 0)
    }
    else if (sortChoice === "BubbleSort"){//Assigns bubbleSort function and creates 'position' and 'passes' tag on row
        button.addEventListener("click", function() {bubbleSort(row.id);}, false);
        button.style.cssFloat = "left"
        row.appendChild(button)
        createAssignSetNode(row, 'position', 0)
        createAssignSetNode(row, 'passes', 0)
        makeSpeedButton(row, speedBubble)
        addArrayToRow(row, array, 0)
        row.getElementsByTagName('td')[0].className = 'warning'

    }
    else if(sortChoice === "HeapSort"){//Add heapSort iteration button, speedSolve button, and set 'count' and 'start' variables to track solve progress
        button.addEventListener("click", function () {heapSort(row.id);}, false);
        button.style.cssFloat = "left"
        row.appendChild(button)
        createAssignSetNode(row, 'count', array.length - 1)
        createAssignSetNode(row, 'start', Math.floor((array.length - 2)/2))
        makeSpeedButton(row, speedHeap)
        addArrayToRow(row, array, 0)
        row.getElementsByTagName('td')[Math.floor((array.length - 2)/2)].className = 'warning'
        }
    else if (sortChoice == "MergeSort"){//add MergeSort Iteration button, speedsolve button, and divList describing order in which to merge subarrays
        button.addEventListener("click", function() {mergeDivs(row);}, false);
        button.style.cssFloat = "left"
        row.appendChild(button)
        var divList = genDivs([0, array.length], [])
        sessionStorage.setItem("divList", JSON.stringify(divList))
        createAssignSetNode(row, 'divList', JSON.stringify(divList))
        makeSpeedButton(row, speedMerge)
        addArrayToRow(row, array, 0)
    }
    
    
    table.appendChild(row);
     
    return table;
}


function addArrayToRow(row, inArray){
    for (let x = 0; x < inArray.length; x++) {//create table data and write array
        var td = document.createElement('td');
        td.innerHTML = inArray[x];
        //td.Align = "left"
        row.appendChild(td);
    }
}


function qsiterateArray(rowId){
    var row = document.getElementById(rowId)
    var newArray = []
    var rowDivs = JSON.parse(row.getAttributeNode('divisions').value)
    var rowArray = getArray(rowId)
    if (rowDivs.length > 0 && row.getAttribute("issorted") == "false"){//if unsorted division exists, and array has not already been sorted, perform a sort step
        for (var i = rowDivs[0][0]; i <= rowDivs[0][1]; i++){
            newArray.push(rowArray[i])
        }
    }
    else{
        alert("Array is already sorted.")
        return
    }
    //pop first element of rowDivs array, add new start points from quicksort
    var quickReturn = quickSort(newArray)
    newArray = quickReturn[0]
    if (quickReturn[1][0] > 1) {rowDivs.push([rowDivs[0][0], rowDivs[0][0] + quickReturn[1][0] - 1])}
    if (quickReturn[1][1] > 1) {rowDivs.push([rowDivs[0][1] - quickReturn[1][1] + 1, rowDivs[0][1]])}
    writeToPage(row, newArray, rowDivs[0][0])//writes updated array  to html
    setTdClass(row, rowDivs[0][0], rowDivs[0][1] + 1, "")//delete old active zone
    rowDivs.splice(rowDivs[0], 1)
    
    row.setAttribute("divisions", JSON.stringify(rowDivs))

    if (!checkSorted(row)){setTdClass(row, rowDivs[0][0], rowDivs[0][1] + 1, "warning")}//if array is not sorted, set active zone
}


function writeToPage(row, inArray, startPoint){// writes values in an array to a row, starting from 'startPoint'
    var rowArray = row.getElementsByTagName("td")
    for (var i = startPoint; i < inArray.length + startPoint; i++){
        rowArray[i].innerHTML = inArray[i - startPoint]
    }
    return 0
}


function getArray(rowId){// loads values from table row and converts to an array of numbers
    var rowArray = document.getElementById(rowId).getElementsByTagName("td")
    newArray = []
    for (let i = 0; i < rowArray.length; i++){
        newArray.push(+rowArray[i].innerHTML)
    }
    return newArray
}


function checkSorted(row){// checks if values in a row have been sorted
    var rowArray = row.getElementsByTagName("td")
    var max = 0
    for (var i = 0; i < rowArray.length; i++){
        if (max <= parseInt(rowArray[i].innerHTML)){
            max = parseInt(rowArray[i].innerHTML)
        }
        else{
            row.className = ""
            return false
            }
    }
    document.getElementById('clickMe' + row.id[6]).disabled = true
    row.setAttribute("issorted", "true")
    row.className = "success"
    return true
}


function shuffle(inArray){//shuffles values in an array
    var holder, index
    for(let i = inArray.length - 1; i; i--){
        index = Math.floor(Math.random() * (i+1))
        holder = inArray[i]
        inArray[i] = inArray[index]
        inArray[index] = holder
    }
}


function bogoSort(rowId){//loads array, shuffles, writes to page, and checks if row is sorted
    if (document.getElementById(rowId).getAttribute("issorted") === "false"){
        newArray = getArray(rowId)
        shuffle(newArray)
        writeToPage(document.getElementById(rowId), newArray, 0)
        checkSorted(document.getElementById(rowId))}
    else {alert("Array is already sorted.")}
}


function bubbleSort(rowId){//loads array and position from html and performs one step, then writes updated array to html
    var row = document.getElementById(rowId)//load array, position, and passes data from html
    var newArray = getArray(rowId)
    var position = parseInt(row.getAttributeNode('position').value)
    var passes = parseInt(row.getAttributeNode('passes').value)
    var rowArray = row.getElementsByTagName('td')
    var holder
    
    if (row.getAttribute("issorted") == "false"){
        if (newArray[position] > newArray[position + 1]){//check if current number is greater than next, and switch positions if so
            holder = newArray[position + 1]
            newArray[position + 1] = newArray[position]
            newArray[position] = holder
        }

        if (position < (newArray.length - 2 - passes)){position++}//reset position if neccessary
        else{
            rowArray[position].className = ""
            position = 0
            passes++
            row.setAttribute('passes', passes)
            }
    }
    else{alert("Row is already sorted.")}

    writeToPage(row, newArray, 0)//write array to page

    rowArray[position].className = 'warning'//set current active number, updates position tag
    if (position > 0){rowArray[position - 1].className = ""}
    row.setAttribute('position', position)
    if(checkSorted(row)){
        rowArray[position].className = ""
    }
}


function setTdClass(row, startPoint, endPoint, newClass){//takes a row, and start and endpoints for an array, and sets the class for those elements in the row
    var rowArray = row.getElementsByTagName('td')
    for (let i = startPoint; i < endPoint; i++){
        rowArray[i].className = newClass
    }
}


function heapSort(rowId){//creates initial heap, then removes root node, shrinking the heap until gone
    var myArray = getArray(rowId)
    var row = document.getElementById(rowId)
    var start = parseInt(row.getAttribute('start'))
    var count = parseInt(row.getAttribute('count'))
    if (start >= 0){// create initial heap, write 'start' attribute to row to keep track of position
        siftNode(myArray, start, count)
        row.setAttribute('start', start - 1)
        row.getElementsByTagName('td')[start].className = ''
        if (start >= 1){row.getElementsByTagName('td')[start - 1].className = 'warning'}
        else{row.getElementsByTagName('td')[0].className = 'warning'
        row.getElementsByTagName('td')[count].className = 'warning'
        }
    }
    else{// move root node to end, shrinking heap by 1 each time, repeat until heap is gone, update 'count' to keep track of heap size
        swapElements(myArray, 0, count)
        siftNode(myArray, 0, --count)
        row.setAttribute('count', count)
        row.getElementsByTagName('td')[count].className = 'warning'
        row.getElementsByTagName('td')[count + 1].className = ''
    }
    writeToPage(row, myArray, 0)
    if (checkSorted(row)){var myRow = row.getElementsByTagName('td')
        for (let i = 0; i < myRow.length; i++){
            myRow[i].className = ''
        }
    }
}


function makeHeap(inArray, count){//Initializes heap by performing the siftNode function on all parent elements in heap
    var start = Math.floor((count - 2)/2)
    while(start){
        siftNode(inArray, start, count - 1)
        start--
        }
    return
}


function siftNode(inArray, start, end){//If parent value < a child value, parent is switched with largest child, if switch occurs, fn is called on original parent
    var root = start
    var swap, lChild, holder
    while (2 * root + 1 <= end){
        lChild = 2 * root + 1
        swap = root

        if (inArray[swap] < inArray[lChild]){swap = lChild}
        if(lChild + 1 <= end && inArray[swap] < inArray[lChild + 1]){swap = lChild + 1}
        if(swap === root){return}
        else{
            swapElements(inArray, root, swap)
            root = swap
            siftNode(inArray, root, end)
        }
    }
}


function swapElements(inArray, one, two){//swaps two element values in an array
    var holder = inArray[one]
    inArray[one] = inArray[two]
    inArray[two] = holder
}


function createAssignSetNode(element, nodeName, nodeValue){//creates attribute, assigns value, and attaches to chosen element
    var myNode = document.createAttribute(nodeName)
    myNode.value = nodeValue
    element.setAttributeNode(myNode)
}


function deleteRow(row){//removes row from table and decrements rowCount
    var rowCount = parseInt(document.getElementById("jsTable").getAttribute("rowcount"))
    row.parentNode.setAttribute('rowcount', --rowCount)
    row.parentNode.removeChild(row)
}


function iterateAll(table){//clicks on iterate button on every row
    var clickEvent = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
});
    var rowList = table.getElementsByTagName("tr")
    var rowInputs = []
    for (let i = 0; i < rowList.length; i++){
        rowInputs = rowList[i].getElementsByTagName('input')
        for (let j = 0; j < 2; j ++){
           if (rowInputs[j].value === 'Iterate Array'){rowInputs[j].dispatchEvent(clickEvent)} 
        }
    }
}


function speedBubble(row){//performs and times bubble sort, prints sorted array and gives time taken for the sort
    var myArray = getArray(row.id)
    setTdClass(row, 0, myArray.length, "")
    var isSorted = true
    var holder
    var start = performance.now()

    for (let i = 0; i < myArray.length; i++){
        isSorted = true
        for (let j = 0; j < myArray.length - i - 1; j++){
            if (myArray[j] > myArray[j + 1]){
                isSorted = false
                holder = myArray[j]
                myArray[j] = myArray[j + 1]
                myArray[j + 1] = holder
            }
        }
        if (isSorted){break}
    }

    var end = performance.now()
    writeToPage(row, myArray, 0)
    endSpeedSort(row)
    alert("It took " + (end - start) + " ms.")
}


function speedQuickCall(row){// reads array, calls quicksort, and records time taken
    var inArray = getArray(row.id)
    setTdClass(row, 0, inArray.length, "")
    var start = performance.now()
    writeToPage(row, speedQuickSort(inArray), 0)
    var end = performance.now()
    endSpeedSort(row)
    alert("It took " + (end - start) + " ms.")
}


function speedQuickSort(inArray){// performs quicksort and returns sorted array
    if (inArray.length > 1){
        var pivot = inArray.pop()
        var less = []
        var more = []
        var pivArray = []
        for (let i = 0; i < inArray.length; i++){
            if (inArray[i] < pivot){less.push(inArray[i])}
            else if (inArray [i] > pivot){more.push(inArray[i])}
            else if (inArray[i] === pivot){pivArray.push(inArray[i])}
        }
        less = speedQuickSort(less)
        more = speedQuickSort(more)
        pivArray.push(pivot)
        return less.concat(pivArray).concat(more)
    }
    else return inArray
}


function speedHeap(row){// performs heapsort and records time taken then writes array and outputs time
    var myArray = getArray(row.id)
    setTdClass(row, 0, myArray.length, '')
    var start = parseInt(row.getAttribute('start'))
    var count = parseInt(row.getAttribute('count'))
    var timeStart = performance.now()
    while (start + 1){// create initial heap
        siftNode(myArray, start--, count)
        }
    while (count){// move root node to end, shrinking heap by 1 each time, repeat until heap is gone
        swapElements(myArray, 0, count)
        siftNode(myArray, 0, --count)
    }
    var end = performance.now()
    writeToPage(row, myArray, 0)
    endSpeedSort(row)
    alert("It took " + (end - timeStart) + " ms.")
}


function genDivs(inDiv, divList){
    if (inDiv[1] == inDiv[0]){
        return divList}

    //divList.push(inDiv)

    if (inDiv[1] - inDiv[0] > 1){

        var right = [inDiv[0] + Math.floor((inDiv[1] - inDiv[0])/2), inDiv[1]]
        var left = [inDiv[0], inDiv[0] + Math.floor((inDiv[1] - inDiv[0])/2)]

        divList.push([right, left])
        divList = genDivs(right, divList)
        divList = genDivs(left, divList)
    }

    return divList
}


function mergeDivs(row){
    var divList = JSON.parse(row.getAttributeNode("divList").value)
    var divs = divList.pop()
    createAssignSetNode(row, "divList", JSON.stringify(divList))

    var myArray = getArray(row.id)
    var div1 = myArray.slice(divs[0][0], divs[0][1])
    var div2 = myArray.slice(divs[1][0], divs[1][1])


    var outDiv = mergeArrays(div1, div2)
    writeToPage(row, outDiv, divs[1][0])
    var myRow = row.getElementsByTagName("td")
    for (let i = 0; i < myRow.length; i++){
        myRow[i].className = ''
    }
    if(!checkSorted(row)){
    
        for (let i = divList[divList.length - 1][1][0]; i < divList[divList.length - 1][0][1]; i++){
            myRow[i].className = "warning"
        }
    }
}


function speedMerge(row){//calls speed Merge fn and tracks time taken to complete, writes result to page and displays time value
    var start = performance.now()
    var myArray = speedMergeSort(getArray(row.id))
    var end = performance.now()
    writeToPage(row, myArray, 0)
    endSpeedSort(row)
    alert("It took " + (end - start) + " ms.")
}


function speedMergeSort(inArray){//cuts input array in half and calls self recursively on both halves, sorted halfs are then merged and sorted result is returned
    if (inArray.length <= 1) {return inArray}

    var left = inArray.slice(0, Math.floor(inArray.length/2))
    var right = inArray.slice(Math.floor(inArray.length/2), inArray.length)

    left = speedMergeSort(left)
    right = speedMergeSort(right)

    return mergeArrays(left, right)
}


function mergeArrays(left, right){//merges two arrays creating sorted and returns sorted array
    var outArray = []

    while(left.length != 0 && right.length !=0){
        if (left[0] <= right[0]){
            outArray.push(left[0])
            left = left.slice(1, left.length)
        }
        else{
            outArray.push(right[0])
            right = right.slice(1, right.length)
        }
    }

    if (left.length == 0){outArray.push.apply(outArray, right)}
    else{outArray.push.apply(outArray, left)}

    return outArray
}


function makeSpeedButton(row, fnName){// creates a button on the row which is associated with a function
    var myButton = document.createElement('input')
    myButton.type = 'button'
    myButton.id = 'speedButton' + row.id[6]
    myButton.className = "btn btn-default"
    myButton.value = 'Timed Solve'
    myButton.addEventListener('click', function(){fnName(row)}) 
    myButton.style.cssFloat = "left"
    row.appendChild(myButton)
}


function endSpeedSort(row){// disables iterate and speed sort buttons and sets row class to 'success'
    document.getElementById('clickMe' + row.id[6]).disabled = true
    document.getElementById('speedButton' + row.id[6]).disabled = true
    row.setAttribute("issorted", "true")
    row.className = "success"
}
