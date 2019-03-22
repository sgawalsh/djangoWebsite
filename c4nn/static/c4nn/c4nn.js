function getVal(selectObject){
	var playerID = selectObject.id
	if (selectObject.value == "Upload Neural Net"){
		setFieldDisplay(playerID, ["Value", "ValueLabel", "Policy", "PolicyLabel", "RecursionCountLabel", "RecursionCount"], "")
		setFieldDisplay(playerID, ["MinimaxDepthLabel", "MinimaxDepth"], "none")
	}else if(selectObject.value == "Minimax Algorithm"){
		document.getElementById((playerID).concat("Value")).value = ""
		document.getElementById((playerID).concat("Policy")).value = ""
		setFieldDisplay(playerID, ["MinimaxDepthLabel", "MinimaxDepth"], "")
		setFieldDisplay(playerID, ["Value", "ValueLabel", "Policy", "PolicyLabel", "RecursionCount", "RecursionCountLabel"], "none")
	}
	else if(selectObject.value == "Default Neural Net"){
		document.getElementById((playerID).concat("Value")).value = ""
		document.getElementById((playerID).concat("Policy")).value = ""
		setFieldDisplay(playerID, ["RecursionCountLabel", "RecursionCount"], "")
		setFieldDisplay(playerID, ["Value", "ValueLabel", "Policy", "PolicyLabel", "MinimaxDepth", "MinimaxDepthLabel"], "none")
	}
	else{
		document.getElementById((playerID).concat("Value")).value = ""
		document.getElementById((playerID).concat("Policy")).value = ""
		setFieldDisplay(playerID, ["Value", "ValueLabel", "Policy", "PolicyLabel", "MinimaxDepth", "MinimaxDepthLabel","RecursionCount", "RecursionCountLabel"], "none")
	}
}

function setFieldDisplay(playerID, fieldList, displayVal){
	for(i = 0; i < fieldList.length; i++){
		document.getElementById((playerID).concat(fieldList[i])).style.display = displayVal
	}
}

function checkUploads(){
	if(document.getElementById("player1").value == "Upload Neural Net"){
		if(document.getElementById("player1Policy").files.length == 0){
			alert("You need to upload a policy file!")
			return false
		}
		if(document.getElementById("player1Value").files.length == 0){
			alert("You need to upload a value file!")
			return false
		}
	}
	if(document.getElementById("player2").value == "Upload Neural Net"){
		if(document.getElementById("player2Policy").files.length == 0){
			alert("You need to upload a policy file!")
			return false
		}
		if(document.getElementById("player2Value").files.length == 0){
			alert("You need to upload a value file!")
			return false
		}
	}
}