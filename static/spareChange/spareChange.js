var billValDic = {"ones":1, "fives":5, "tens":10, "twenties":20, "fifties":50, "hundreds":100}

function addPerson(){
    var table = document.getElementById("people")
    var row = document.createElement("tr") 
    var bills = [["ones", 1], ["fives", 5], ["tens", 10], ["twenties", 20], ["fifties", 50], ["hundreds", 100]]
    var person = {}
    var value
    var bank = 0
    person["name"] = document.getElementById("name").value
    if (person["name"] == ""){
        alert("Please enter a name for this person")
        return
    }
    var people = JSON.parse(document.getElementById("hiddenPeople").value)
    for (let i = 0; i < people.length; i++){
        if (person["name"] == people[i]["name"]){
            alert("Please enter a unique name for this person.")
            return
        }
    }
    appendTd(row, person["name"])
    person["has"] = {}
    for (let i = 0; i < bills.length; i++){
        value = parseInt(document.getElementById(bills[i][0]).value)
        appendTd(row, value)
        bank += (value * bills[i][1])
        person["has"][bills[i][0]] = value
    }
    appendTd(row, bank)
    person["owed"] = parseInt(document.getElementById("personOwed").value)
    appendTd(row, person["owed"])
    document.getElementById("totalBankVsTotalOwed").value = parseInt(document.getElementById("totalBankVsTotalOwed").value) + bank - person["owed"]
    bank = 0
    person["needs"] = {}
    for (let i = 0; i < bills.length; i++){
        value = parseInt(document.getElementById(bills[i][0] + "Needed").value)
        appendTd(row, value)
        bank += (value * bills[i][1])
        person["needs"][bills[i][0]] = value
    }
    if (bank > person["bank"]){
        alert("Sum of bills needed must be less than inital bank.")
        return
    }
    people.push(person)
    document.getElementById("hiddenPeople").value = JSON.stringify(people)
    table.appendChild(row)
    clearEntries(document.getElementById("input"))
}

function appendTd(row, value){
    var element = document.createElement("p")
    element.innerHTML = value
    var data = document.createElement("td")
    data.appendChild(element)
    row.appendChild(data)
}

function clearEntries(parEl){
    rows = parEl.getElementsByTagName("tr")
    var data, input
    for (let i = 1; i < rows.length; i++){
        data = rows[i].getElementsByTagName("td")
        for (let j = 0; j < data.length; j++){
            input = data[j].getElementsByTagName("input")
            input[0].value = 0
        }
    }
    document.getElementById("name").value = ""
    document.getElementById("prevAmounts").value = JSON.stringify({"ones": 0, "fives":0, "tens":0, "twenties":0, "fifties":0, "hundreds":0})
}

function checkBank(){
    if (parseInt(document.getElementById("totalBankVsTotalOwed").value) != 0){
        alert("Bank - Total Owed must equal 0 for a solution to exist.")
        return
    }
    document.getElementById("peopleForm").submit()
}

function changeOwed(billName){
    var newVal = parseInt(document.getElementById(billName).value)
    if (isNaN(newVal)){return}
    var myDict = JSON.parse(document.getElementById("prevAmounts").value)
    var diff = newVal - myDict[billName]
    myDict[billName] = newVal
    document.getElementById("prevAmounts").value = JSON.stringify(myDict)
    document.getElementById("personOwed").value = (diff * billValDic[billName]) + parseInt(document.getElementById("personOwed").value)
}
