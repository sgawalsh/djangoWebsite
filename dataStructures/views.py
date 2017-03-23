from django.shortcuts import render

def index(request):
    return render(request, "dataStructures/basic.html")
	
def bst(request):
	return render(request, "dataStructures/binarySearchTree.html")

def heap(request):
	return render(request, "dataStructures/heap.html")