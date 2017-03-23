from django.shortcuts import render, HttpResponse
from spareChange.models import personChange
import json
import pdb

def index(request):
    if request.method == "POST":
        if json.loads(request.POST.get("totalBankVsTotalOwed", None)) != 0:
            return render(request, "spareChange/answerPage.html", {"failMessage": "Total Bank - Total Owed must be equal to zero."})
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
            #del person["needs"]# may be needed for 3
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

        result = recursiveDistribution(pool, people, bills, billList, bank)
        if result[0]:
            people.append(result[1])
            resultDic = {}
            peopleAfterModelList = []
            for each in people:
                peopleAfterModelList.append(personChange(name = each["name"], ones = each["has"]["ones"], fives = each["has"]["fives"], tens = each["has"]["tens"], twenties = each["has"]["twenties"], fifties = each["has"]["fifties"], hundreds = each["has"]["hundreds"]))
                resultDic[each["name"]] = each["has"]
            return render(request, "spareChange/answerPage.html", {"before":peopleBefore, "after": resultDic, "beforeModel": peopleBeforeModelList, "afterModel": peopleAfterModelList, "billList": billList[::-1]})
        else:
            return render(request, "spareChange/answerPage.html", {"failMessage": "No solution found."})
    else:
        return render(request, "spareChange/spareChangeBasic.html")

def recursiveDistribution(pool, people, bills, billList, bank):
    person = people.pop()
    if person["owed"]:# give person money owed, starting with max amount of largest bills
        for bill in billList:
            if person["owed"] >= bills[bill] and pool[bill]:
                billNum = min(person["owed"] // bills[bill], pool[bill])
                person["owed"] -= bills[bill] * billNum
                bank -= bills[bill] * billNum
                pool[bill] -= billNum
                person["has"][bill] += billNum

    if person["owed"]: # no solution available, return bills to pool and return False
        for bill in billList:
            if person["has"][bill] > person["needs"][bill]:
                billNum = person["has"][bill] - person["needs"][bill]
                person["owed"] += bills[bill] * billNum
                bank += bills[bill] * billNum
                pool[bill] += billNum
                person["has"][bill] -= billNum
        return (False, person)

    if people:#call fn recursively and try different combinations of bills, if successful combo is found return true, else return false
        myBillList = list(billList[::-1])
        while True:
            result = recursiveDistribution(pool, people, bills, billList, bank)
            people.append(result[1])
            if not result[0]:
                while(person["has"][myBill] <= person["needs"][myBill] and myBillList):
                    myBill = myBillList.pop()
                if person["has"][myBill] > person["needs"][myBill]:
                    person["has"][myBill] -= 1
                    person["owed"] += bills[myBill]
                    bank += bills[myBill]
                    pool[myBill] += 1
                    #give guy money owed in smaller bills
                    for myBill2 in myBillList[::-1]:
                        pass
                else:
                    return (False, person)
            else:
                return (True, person)
    else:
        return (True, person)

    return personChange(name = inName, ones = inDic["ones"], fives = inDic["fives"], tens = inDic["tens"], twenties = inDic["twenties"], fifties = inDic["fifties"], hundreds = inDic["hundreds"])


def recursiveDistribution2(pool, people, bills, billList, bank):
    #give first person max amount of largest bills
    #continue for each bill giving max amount each time
    #when owed = 0, go to next person and repeat process
    # if solution (owed = 0 for everyone) is not found, go back and take away 1 largest bill and try to replace with next largest
    # repeat until owed = 0 cannot be reached, then take away 2 largest bills, etc.
    solved = True
    for person in people:
        if person["owed"]:
            solved = False
            for bill in billList:
                billNum = min(person["owed"] // bill[bill], pool[bill])
                person["owed"] -= bills[bill] * billNum
                bank -= bills[bill] * billNum
                pool[bill] -= billNum
                person["has"][bill] += billNum
                while billNum > 0:
                    result = recursiveDistribution2(pool, people, bills, billList, bank)
                    if result[0]:
                        return result
                    else:
                        billNum -= 1
                        person["owed"] += bills[bill]
                        bank += bills[bill]
                        pool[bill] += 1
                        person["has"][bill] -= 1
    if solved:
        return([True, people])
    else:
        return([False])

def recursiveDistribution3(pool, people, bills, billList, bank):
    solved = True
    for person in people:
        if person["owed"]:
            solved = False
            for bill in billList:
                if pool[bill] and person["owed"] >= bills[bill]:
                    person["owed"] -= bills[bill]
                    bank -= bills[bill]
                    pool[bill] -= 1
                    person["has"][bill] += 1
                    if recursiveDistribution(pool, people, bills, billList, bank):
                        return True
                    else:
                        person["owed"] += bills[bill]
                        bank += bills[bill]
                        pool[bill] += 1
                        person["has"][bill] -= 1
    if solved:
        return True
    else:
        return False

def dictToModel(inName, inDic):
    return personChange(name = inName, ones = inDic["ones"], fives = inDic["fives"], tens = inDic["tens"], twenties = inDic["twenties"], fifties = inDic["fifties"], hundreds = inDic["hundreds"])
