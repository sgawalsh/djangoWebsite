from django.shortcuts import render
from django.http import HttpResponse
import json

def index(request):
    return render(request, "electionProbability/chooseCandidates.html")

def setStates(request):
    if request.is_ajax:
        canTable = json.loads(request.POST.get("candidatesList", None))
        if len(canTable) < 2:
            return render(request, "electionProbability/chooseCandidates.html", {"errorMessage": "Please create at least two candidates in order to proceed to the State creation page."})
        return render(request, "electionProbability/setStates.html", {"canList": canTable, "canListJson": json.dumps(canTable)})
    else:
        return HttpResponse("<h1>NO</h1>")
