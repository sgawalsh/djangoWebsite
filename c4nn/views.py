from django.shortcuts import render
from django.http import HttpResponse
import pdb, json, c4nn.engine as engine, c4nn.minimax as minimax, c4nn.mc as mc, os, tensorflow as tf

# Create your views here.
def index(request):
	return render(request, "c4nn/index.html")
	
def takeTurn(request):
	if request.method == "POST":
		isSolved = False
		isDraw = False
		if request.POST.get("boardState"):
			boardState = json.loads(request.POST.get("boardState"))
			legalMoves = json.loads(request.POST.get("legalMoves"))
			playerTurn = request.POST.get("playerTurn")
			currPlayer = request.POST.get("player" + playerTurn)
			player1Score = int(request.POST.get("player1Score"))
			player2Score = int(request.POST.get("player2Score"))
			
			if currPlayer == "Human Player":
				choice = int(request.POST.get("playerChoice"))
				for i in range(6):
					if not boardState[5 - i][choice][0]:
						boardState[5 - i][choice][0] = True
						boardState[5 - i][choice][1] = playerTurn == '1'
						if i == 5:
							for move in legalMoves:
								if move == choice:
									del move
						break
				
				board = engine.board(toBoardCells(boardState), legalMoves)
				isSolved = board.checkWin(5 - i, choice, playerTurn == '1')
				if isSolved:
					pdb.set_trace()
					if playerTurn == '1':
						player1Score += 1
					else:
						player2Score += 1
				else:
					isDraw = board.checkDraw()
				
				playerTurn = '1' if playerTurn == '2' else '2'
								
				return render(request, "c4nn/takeTurn.html", {"legalMoves": legalMoves, "playerTurn": playerTurn, "player1": request.POST.get("player1"), "player2": request.POST.get("player2"), "isPlayerTurn": request.POST.get("player" + playerTurn) == "Human Player", "boardState" : toBoardArray(board.board), "player1MinimaxDepth": request.POST.get("player1MinimaxDepth"), "player2MinimaxDepth": request.POST.get("player2MinimaxDepth"), "player1RecursionCount": request.POST.get("player1RecursionCount"), "player2RecursionCount": request.POST.get("player2RecursionCount"), "isSolved": isSolved, "isDraw": isDraw, "player1Score": player1Score, "player2Score": player2Score})
				
			board = engine.board(toBoardCells(boardState), legalMoves)
			
			if currPlayer == "Minimax Algorithm":
				tree = minimax.miniTree(board, playerTurn == '1', int(request.POST.get("player" + str(playerTurn) + "MinimaxDepth")))
				#print(tree.__str__())
				board = board.serveNextState(tree.getMove(), playerTurn == '1')[0]
			elif currPlayer == "Default Neural Net" or currPlayer == "Upload Neural Net":
				if currPlayer == "Default Neural Net":
					myTree = mc.monteTree(board, playerTurn == '1', tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "\\models\\the_policy_champ"), tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "\\models\\the_value_champ"))
				
				elif currPlayer == "Upload Neural Net":
					try:
						for f in request.session.keys():
							if f[7:] == "Value":
								nnVal = tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "\\userUploads\\" + request.COOKIES['sessionid'] + "\\" + f)
							elif f[7:] == "Policy":
								nnPol = tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "\\userUploads\\" + request.COOKIES['sessionid'] + "\\" + f)
						
						myTree = mc.monteTree(board, playerTurn == '1', nnPol, nnVal)
						
					except:
						print("exception")
				
				for _ in range(int(request.POST.get("player" + str(playerTurn) + "RecursionCount"))):#build tree
					myTree.nnSelectRec(myTree.root)
				myTree.makeMove(True)# set root to next move
				board = myTree.root.board
				isSolved = board.checkWin(myTree.root.rowNum, myTree.root.colNum, not myTree.root.isRedTurn)
				if isSolved:
					if playerTurn == '1':
						player1Score += 1
					else:
						player2Score += 1
				else:
					isDraw = board.checkDraw()
					
			else:
				return HttpResponse("stop that")
			
			playerTurn = '1' if playerTurn == '2' else '2'
		else:
			dir = os.path.dirname(os.path.realpath(__file__)) + "\\userUploads"
			for item in os.listdir(dir):
				if os.path.isfile(os.path.join(dir, item)) or os.path.getmtime(os.path.join(dir, item)) > 86400000000:#24 hrs
					os.remove(os.path.join(dir, item))
			board = engine.board()
			playerTurn = '1'
			if request.POST.get("player1") == "Upload Neural Net" or request.POST.get("player2") == "Upload Neural Net":
				for f in request.FILES:
					#verify file is valid NN, save locally, id by session
					try:
						nn = tf.keras.models.load_model(request.FILES[f])
						if f[7:] == "Value":
							if nn.layers[len(nn.layers) - 1].output_shape != (None, 3):
								raise Exception('The last layer of the value network must have an output shape of (None, 3).') 
						elif f[7:] == "Policy":
							if nn.layers[len(nn.layers) - 1].output_shape != (None, 7):
								raise Exception('The last layer of the policy network must have an output shape of (None, 7).') 
						dir2 = dir + "\\" + request.COOKIES["sessionid"]
						if not os.path.exists(dir2):# create dir for session if it does not exist
							os.mkdir(dir2)
						nn.save(dir2 + "\\" + f)
						request.session[f] = None
					except OSError:
						return render(request, "c4nn/index.html", {"errorMessage": "There was a problem with your uploaded files. Please check the files and try again."})
					except Exception as error:
						return render(request, "c4nn/index.html", {"errorMessage": "There was a problem with your uploaded files. Please check the files and try again.\n" + str(error)})
		board.printBoard()
		return render(request, "c4nn/takeTurn.html", {"legalMoves": board.legalMoves, "playerTurn": playerTurn, "player1": request.POST.get("player1"), "player2": request.POST.get("player2"), "isPlayerTurn": request.POST.get("player" + playerTurn) == "Human Player", "boardState": toBoardArray(board.board), "player1MinimaxDepth": request.POST.get("player1MinimaxDepth"), "player2MinimaxDepth": request.POST.get("player2MinimaxDepth"), "player1RecursionCount": request.POST.get("player1RecursionCount"), "player2RecursionCount": request.POST.get("player2RecursionCount"), "isSolved": isSolved, "isDraw": isDraw, "player1Score": 0, "player2Score": 0})
	else:
		return render(request, "c4nn/index.html")
		
def toBoardArray(cellBoard):
	for row in cellBoard:
		for i in range(len(row)):
			#row[i] = engine.cell(row[i][0], row[i][1])
			row[i] = [row[i].isFilled, row[i].isRed]
	return cellBoard
	
def toBoardCells(boardArray):
	for row in boardArray:
		for i in range(len(row)):
			row[i] = engine.cell(row[i][0], row[i][1])
	return boardArray