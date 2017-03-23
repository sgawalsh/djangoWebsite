function addCandidate(canName){
    if (canName == ""){
        alert("Please choose a name for the candidate")
        return
    }
    
    var hiddenList = document.getElementById("candidatesList")
    var canNames = JSON.parse(hiddenList.value)
    if (canNames.indexOf(canName) != -1){
        alert("Duplicate name. Please choose a unique name for the candidate.")
        return
    }
    canNames.push(canName)
    hiddenList.value = JSON.stringify(canNames)
    document.getElementById("canName").value = ""
    var table = document.getElementById("candidates")
    var row = document.createElement("tr") 
    var data = document.createElement("td")
    row.appendChild(data)
    var can = document.createElement("p")
    can.innerHTML = canName
    can.id = "can" + (table.childNodes.length + 1)
    data.appendChild(can)
    table.appendChild(row)
}

function setStates(){
    var tdList = document.getElementById("candidates").getElementsByTagName("td")
    var nameList = []
    for (let i = 0; i < tdList.length; i++){
        nameList.push(tdList[i].firstChild.innerHTML)
    }
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});

    $.ajax({
        type:"POST",
        url: "setStates"
    })

}

function addState(){
    if (document.getElementById("stateName").value == ""){
        alert("Please enter a name for the state")
        return
    }
    var canList = JSON.parse(document.getElementById("candidates").value)
    var row = document.createElement("tr")
    var td = document.createElement("td")
    var header = document.createElement("h4")
    header.innerHTML = document.getElementById("stateName").value
    td.appendChild(header)
    row.appendChild(td)
    td = document.createElement("td")
    td.innerHTML = document.getElementById("seats").value
    row.appendChild(td)
    var sum = 0
    for (let i = 0; i < canList.length; i++){
        td = document.createElement("td")
        td.innerHTML = document.getElementById(canList[i] + "Percentage").value
        td.id = JSON.stringify([canList[i], header.innerHTML])
        sum += parseInt(td.innerHTML)
        row.appendChild(td)
    }
    if (sum != 100){
        alert("Make sure percentages sum to 100 to add a row")
        return
    }
    document.getElementById("states").appendChild(row)
}

function calcProb(){
    var canList = JSON.parse(document.getElementById("candidates").value)
    var rows = document.getElementById("states").getElementsByTagName("tr")
    var pList = []
    var pEntry = []
	var seatList = {}
    for (let i = 0; i < rows.length; i++){
        pEntry=[]
        for (let j = 2; j < canList.length + 2; j++){
            pEntry.push([rows[i].childNodes[j].id, parseInt(rows[i].childNodes[j].innerHTML)])
        }
        seatList[rows[i].childNodes[0].firstChild.innerHTML] = parseInt(rows[i].childNodes[1].innerHTML)
        pList.push(pEntry)
    }
    cartProdWithPoints(seatList, pList)
}

function cartProdWithPoints(seatList, pList) {
    var args = []
    var buffer = []
    for (let i = 0; i < pList.length; i++){
        buffer = []
        for (let j = 0; j < pList[i].length; j++){
            buffer.push(pList[i][j])
        }
        args.push(buffer)
    }
    var end  = args.length - 1

    var result = []

    function addTo(curr, start) {
        var first = args[start], last  = (start === end)

        for (var i = 0; i < first.length; ++i) {
            var copy = curr.slice()
            copy.push(first[i])

            if (last) {result.push(copy)}
            else {addTo(copy, start + 1)}
        }
    }

    if (args.length) {addTo([], 0)} 
    else {result.push([])}

    var canList = JSON.parse(document.getElementById("candidates").value)
    var canPoints = {}//keep track of points one in each scenario
    var canPercent = {}//keep track of percent chance of winning
    for (let j = 0; j < canList.length; j++){
        canPoints[canList[j]] = 0
        canPercent[canList[j]] = 0
    }
    var max = 0
    var maxKey = ""
    var state = []
    var percent
    for (let j = 0; j < result.length; j++){
        percent = 100
        for (let k = 0; k < result[j].length; k++){
            state = result[j][k]
            percent *= state[1] / 100
            canPoints[JSON.parse(state[0])[0]] += seatList[JSON.parse(state[0])[1]]
        }
        //check winner and award % chance of win
        max = 0
        maxKey = ""
        var tieList = [], isTie
        for (var key in canPoints){
            if (canPoints[key] > max){
                isTie = false
                max = canPoints[key]
                maxKey = key
                tieList = [key]
            }
            else if (canPoints[key] == max){
                maxKey = "tie"
                isTie = true
                tieList.push(key)
            }
            canPoints[key] = 0
        }
        if (isTie){
            maxKey = "Tie: "
            for (let i = 0; i < tieList.length; i++){
                maxKey += tieList[i] + " / "
            }
            maxKey = maxKey.slice(0, maxKey.length - 3)
            if(!(maxKey in canPercent)){canPercent[maxKey] = 0}
        }
        canPercent[maxKey] += percent
    }
    makePie(canPercent)
}

function makePie(canDict){
    var pie = new Bluff.Pie('results', 400)
    pie.theme_keynote();
    pie.title = "Candidates' Chances of Winning"
    var canKeys = Object.keys(canDict)
    for (let i = 0; i < canKeys.length; i++){
        pie.data(canKeys[i], canDict[canKeys[i]])
    }
    pie.draw()
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
