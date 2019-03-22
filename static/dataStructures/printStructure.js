function printTree(tree){//prints out tree to table using a new row for each level and 'td' elements for nodes
	var tableBody = document.getElementById("structTable")
	while (tableBody.firstChild) {//clear table
    tableBody.removeChild(tableBody.firstChild);
	}
	
	var rowNum = Math.floor(Math.log2(tree.length)) + 1
	
	for (let i = 0; i < rowNum; i++){// create row
		var tr = document.createElement("tr")
		
		for (let j = 0; j < (Math.pow(2, rowNum - i - 1)) - 1; j ++){//2^(rownum - i - 1) - 1
			tr.appendChild(document.createElement("td"))
		}
		
		for (let j = 0; j < Math.pow(2, i); j++){// add elements
			if(typeof tree[Math.pow(2,i) + j - 1] === 'undefined') {break}//break when tree is finished
			if (j > 0){
				for (let k = 0; k < Math.pow(2, rowNum - i) - 1; k++){//2^(rownum - i) - 1 spaces between elements 
					var td = document.createElement("td")
					tr.appendChild(td)
				}
			}
			var td = document.createElement("td")
			td.innerHTML = tree[Math.pow(2,i) + j - 1]
			tr.appendChild(td)
		}
		tableBody.appendChild(tr)
	}
}