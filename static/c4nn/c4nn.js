function checkUploads(){
	if(document.getElementById("player1").value == "Upload Neural Net"){
		if(document.getElementById("player1Policy").files.length == 0){
			alert("You need to upload a policy file!")
			return False
		}
		if(document.getElementById("player1Value").files.length == 0){
			alert("You need to upload a value file!")
			return False
		}
	}
	if(document.getElementById("player2").value == "Upload Neural Net"){
		if(document.getElementById("player2Policy").files.length == 0){
			alert("You need to upload a policy file!")
			return False
		}
		if(document.getElementById("player2Value").files.length == 0){
			alert("You need to upload a value file!")
			return False
		}
	}
}