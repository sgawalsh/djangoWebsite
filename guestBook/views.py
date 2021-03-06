from django.shortcuts import render
from django.http import HttpResponse
import json, pdb,datetime, base64, os
from PIL import Image

def index(request):
	return render(request, "guestBook/basic.html")

def saveCanvas(request):
	if request.method == "POST":
		fh = open("guestBook/canvases/current.png", "wb")
		fh.write(base64.b64decode(request.POST.get('newOriginal', None).split("base64,")[1]))
		fh.close()
		fh = open("guestBook/canvases/userDrawings/" + str(datetime.datetime.today()) + " - " + str(request.POST.get('userName', None)) + ".png", "wb")
		fh.write(base64.b64decode(request.POST.get('userDrawing', None).split("base64,")[1]))
		fh.close()
		return HttpResponse("Saved Canvases")
	else:
		return HttpResponse("<h1>NO</h1>")

def saveCanvasDelOldest(request):
	if request.method == "POST":
		try:
			path = os.getcwd() + "/guestBook/canvases/userDrawings/"
			fileList = os.listdir(path)
			if len(fileList) > 5:
				fileList = orderByDate(fileList)
				while len(fileList) > 5:
					os.remove(path + fileList[0])
					fileList = fileList[1:len(fileList)]
			
			fileName = "guestBook/canvases/userDrawings/" + str(datetime.datetime.today()) + " - " + str(request.POST.get('userName', None)) + ".png"
			f = open(fileName, "wb")
			f.write(base64.b64decode(request.POST.get('userDrawing', None).split("base64,")[1]))
			f.close()
			newIm = Image.open(fileName)
			origIm = Image.open("guestBook/canvases/current.png")
			newIm.resize(origIm.size)
			origIm = Image.alpha_composite(origIm, newIm)
			origIm.save("guestBook/canvases/current.png")
			return HttpResponse("Saved Canvases")
		except Exception as e:
			return HttpResponse(str(e))
	else:
		return HttpResponse("<h1>NO</h1>")

def setOriginal(request):
	if request.is_ajax():
		with open("guestBook/canvases/current.png", "wb") as f:
			f.write(base64.b64decode(request.POST.get('newOriginal', None).split("base64,")[1]))
			f.close()
		return HttpResponse("Great success!")
	else:
		return HttpResponse("<h1>NO</h1>")

def loadCanvas(request):
	if request.is_ajax():
		with open("guestBook/canvases/current.png", "rb") as f:
			passData = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
			f.close()
		return HttpResponse(json.dumps({"originalCanvas": passData}), content_type = "application/json")
	else:
		return HttpResponse("<h1>NO</h1>")

def createOriginal(request):
	if request.is_ajax():
		drawingList = list()
		path = os.getcwd() + "/guestBook/canvases/userDrawings/"
		fileList = orderByDate(os.listdir(path))
		for fileName in fileList:
			with open(path + fileName, "rb") as f:
				drawingList.append("data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8"))
				f.close()
		return HttpResponse(json.dumps({"userDrawings": drawingList}), content_type = "application/json")
	else:
		return HttpResponse("<h1>NO</h1>")

def loadDrawing(request):
	if request.is_ajax():
		drawingChoice = request.POST.get("drawingChoice")
		if drawingChoice == "All":
			with open("guestBook/canvases/current.png", "rb") as f:
				passData = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
				f.close()
			return HttpResponse(passData)
		else:
			path = os.getcwd() + "/guestBook/canvases/userDrawings/"
			drawingChoice = drawingChoice + ".png"
			for fileName in os.listdir(path):
				if drawingChoice in fileName:
					with open(path + fileName, "rb") as f:
						passData = "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
						f.close()
					return HttpResponse(passData)
	else:
		return HttpResponse("<h1>NO</h1>")

def loadList(request):
	if request.is_ajax:
		path = os.getcwd() + "/guestBook/canvases/userDrawings/"
		userNames = []
		fileList = os.listdir(path)
		for i in range(len(fileList)):
			newDate = datetime.datetime.strptime(fileList[i].split(" - ")[0], "%Y-%m-%d %H:%M:%S.%f")
			fileList[i] = (newDate, fileList[i])
		fileList.sort(key=lambda x: x[0])
		for fileName in fileList:
		   userNames.append(fileName[1].split("- ", 1)[1].split(".png",1)[0])
		return HttpResponse(json.dumps({"userNames": userNames}), content_type = "application/json")
	else:
		return HttpResponse("<h1>NO</h1>")

def orderByDate(fileList):
	for i in range(len(fileList)):
		newDate = datetime.datetime.strptime(fileList[i].split(" - ")[0], "%Y-%m-%d %H:%M:%S.%f")
		fileList[i] = (newDate, fileList[i])
	fileList.sort(key=lambda x: x[0])
	for i in range(len(fileList)):
		fileList[i] = fileList[i][1]
	return fileList
