from django.shortcuts import render
import json
from django.http import HttpResponse
import pdb

def index(request):
    return render(request, "connect4/index.html")
    
def recordLoss(request):
    if request.method == "POST":
        with open("connect4/lossRecords/lossRecords.json", "r") as f:
            losses = json.load(f)
        
        with open("connect4/lossRecords/lossRecords.json", "w") as f:
            losses.append(request.POST.get('data', "default"))
            if len(losses) > 10:
                losses.pop(0)
            json.dump(losses, f)
        return HttpResponse("Recorded Loss")
    else:
        return HttpResponse("<h1>Go Away</h1>")