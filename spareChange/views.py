from django.shortcuts import render, HttpResponse
from spareChange.models import personChange
import json
import pdb

def index(request):
    if request.method == "POST":
        people = json.loads(request.POST.get("hiddenPeople", None))
        bills = {"ones": 1, "fives": 5, "tens": 10, "twenties": 20, "fifties": 50, "hundreds": 100}
        pool = {}
        for bill in bills.keys():
            pool[bill] = 0
        #put all money in pool
        peopleBefore = {}
        bank = 0
        billAmount = 0
        for person in people:
            peopleBefore[person["name"]] = {}
            for bill in person["has"].keys():
                billAmount = person["has"][bill]
                peopleBefore[person["name"]][bill] = billAmount
                pool[bill] += billAmount
                bank += billAmount * bills[bill]
                person["has"][bill] = 0

        peopleBeforeModelList = []

        for name, wallet in peopleBefore.items():
            peopleBeforeModelList.append(dictToModel(name, wallet))

        #distribute bills needed to each person
        for person in people:
            for bill in person["needs"].keys():
                if person["needs"][bill]:# assign bills from pool to 'has', decrease person's bank and communal bank
                    if person["needs"][bill] > pool[bill]:
                        pass#no solution possible, return fail message
                    else:
                        billAmount = person["needs"][bill]
                        person["has"][bill] = billAmount
                        pool[bill] -= billAmount
                        bank -= billAmount * bills[bill]
                        person["owed"] -= billAmount * bills[bill]
            del person["needs"]# may be needed for 3
        del billAmount

        #try all possible combinations to see if solution exists
        #clone pool, iterate through people
        #starting from highest bill, attempt to put bills from pool in person["has"], reducing person's bank
        #if person's bank reaches 0, go to next person
        #if a bank cannot be set to 0 -> failure!
        #if all banks reach 0 -> success!
        #else, undo transactions and see if next other combination works

        billList = sorted(bills.items(), key = lambda x: x[1], reverse = True)

        for i in range(len(billList)):
            billList[i] = billList[i][0]

        result = recursiveDistribution(pool, people, bills, billList, billList, bank)
        if result:
            resultDic = {}
            peopleAfterModelList = []
            for each in people:
                peopleAfterModelList.append(personChange(name = each["name"], ones = each["has"]["ones"], fives = each["has"]["fives"], tens = each["has"]["tens"], twenties = each["has"]["twenties"], fifties = each["has"]["fifties"], hundreds = each["has"]["hundreds"]))
            peopleBeforeModelList.sort(key = lambda x: x.name)
            peopleAfterModelList.sort(key = lambda x: x.name)
            peopleDifferenceModelList = []
            for i in range(len(peopleBeforeModelList)):
                peopleDifferenceModelList.append(personChange(name = peopleBeforeModelList[i].name, ones = peopleAfterModelList[i].ones - peopleBeforeModelList[i].ones, fives = peopleAfterModelList[i].fives - peopleBeforeModelList[i].fives, tens = peopleAfterModelList[i].tens - peopleBeforeModelList[i].tens, twenties = peopleAfterModelList[i].twenties - peopleBeforeModelList[i].twenties, fifties = peopleAfterModelList[i].fifties - peopleBeforeModelList[i].fifties, hundreds = peopleAfterModelList[i].hundreds - peopleBeforeModelList[i].hundreds))
            return render(request, "spareChange/answerPage.html", {"beforeModel": peopleBeforeModelList, "afterModel": peopleAfterModelList, "differenceModel": peopleDifferenceModelList, "billList": billList[::-1]})
        else:
            return render(request, "spareChange/answerPage.html", {"failMessage": "No solution found."})
    else:
        return render(request, "spareChange/spareChangeBasic.html")

def recursiveDistribution(pool, people, bills, fullBillList, scopeBillList, bank):
    solved = True
    resetList = False
    for person in people:
        if person["owed"]:
            solved = False
            if not scopeBillList:
                return False
            for bill in scopeBillList:
                if moneyLeft(scopeBillList, pool, bills) < person["owed"]:
                    return False
                if pool[bill] and person["owed"] >= bills[bill]:
                    person["owed"] -= bills[bill]
                    bank -= bills[bill]
                    pool[bill] -= 1
                    person["has"][bill] += 1
                    if recursiveDistribution(pool, people, bills, fullBillList, scopeBillList, bank):
                        return True
                    else:
                        person["owed"] += bills[bill]
                        bank += bills[bill]
                        pool[bill] += 1
                        person["has"][bill] -= 1
                        del scopeBillList[0]#do not check for this bill in subsequent loops
            resetList = True
        if resetList:
            scopeBillList = list(fullBillList)
    if solved:
        return True
    else:
        return False

def moneyLeft(billList, pool, bills):
    moneySum = 0
    for bill in billList:
        moneySum += pool[bill] * bills[bill]
    return moneySum

def dictToModel(inName, inDic):
    return personChange(name = inName, ones = inDic["ones"], fives = inDic["fives"], tens = inDic["tens"], twenties = inDic["twenties"], fifties = inDic["fifties"], hundreds = inDic["hundreds"])
