from django.shortcuts import render
from django.http import HttpResponse
from c4nn.head2Head import head2Head
from shutil import rmtree
import pdb, json, c4nn.engine as engine, c4nn.minimax as minimax, c4nn.mc as mc, os, time, tensorflow as tf

# Create your views here.
def index(request):
	return render(request, "c4nn/index.html")
	
def takeTurn(request):
	if request.method == "POST":
		isSolved = False
		isDraw = False
		if request.POST.get("boardState") and request.POST.get("resetGameFlag", False) != 'true': # move is being played
			boardState = json.loads(request.POST.get("boardState"))
			legalMoves = json.loads(request.POST.get("legalMoves"))
			playerTurn = request.POST.get("playerTurn")
			currPlayer = request.POST.get("player" + playerTurn)
			player1Score = int(request.POST.get("player1Score"))
			player2Score = int(request.POST.get("player2Score"))
			autoplay = request.POST.get('autoplay', False) == ''
			autoPlayCount = int(request.POST.get("autoPlayCount"))
			
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
					if playerTurn == '1':
						player1Score += 1
					else:
						player2Score += 1
				else:
					isDraw = board.checkDraw()
					
				if autoplay and (isDraw or isSolved):
					autoPlayCount += 1
					if autoPlayCount >= int(request.POST.get("autoPlayGames")):
						autoplay = False
						autoPlayCount = 0
				playerTurn = '1' if playerTurn == '2' else '2'
				
				return render(request, "c4nn/takeTurn.html", {"legalMoves": legalMoves, "playerTurn": playerTurn, "player1": request.POST.get("player1"), "player2": request.POST.get("player2"), "isPlayerTurn": request.POST.get("player" + playerTurn) == "Human Player", "boardState" : toBoardArray(board.board), "player1MinimaxDepth": request.POST.get("player1MinimaxDepth"), "player2MinimaxDepth": request.POST.get("player2MinimaxDepth"), "player1RecursionCount": request.POST.get("player1RecursionCount"), "player2RecursionCount": request.POST.get("player2RecursionCount"), "player1Stochastic": request.POST.get("player1Stochastic"), "player2Stochastic": request.POST.get("player2Stochastic"), "isSolved": isSolved, "isDraw": isDraw, "player1Score": player1Score, "player2Score": player2Score, "autoplay": autoplay, "autoPlayCount": autoPlayCount, "autoPlayGames": int(request.POST.get("autoPlayGames")) if request.POST.get("autoPlayGames", False) else 0})
				
			board = engine.board(toBoardCells(boardState), legalMoves)
			
			if currPlayer == "Minimax Algorithm":
				tree = minimax.miniTree(board, playerTurn == '1', int(request.POST.get("player" + str(playerTurn) + "MinimaxDepth")))
				board, row, col = board.serveNextState(tree.getMove(), playerTurn == '1')
				isSolved = board.checkWin(row, col, playerTurn == '1')
			elif currPlayer == "Default Neural Net" or currPlayer == "Upload Neural Net":
				if currPlayer == "Default Neural Net":
					myTree = mc.monteTree(board, playerTurn == '1', tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/models/the_policy_champ"), tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/models/the_value_champ"))
				
				elif currPlayer == "Upload Neural Net":
					try:
						for f in request.session.keys():
							if f[7:] == "Value":
								nnVal = tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/userUploads/" + request.session.session_key + "/" + f)
							elif f[7:] == "Policy":
								nnPol = tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/userUploads/" + request.session.session_key + "/" + f)
						
						myTree = mc.monteTree(board, playerTurn == '1', nnPol, nnVal)
						
					except Exception as error:
						return render(request, "c4nn/index.html", {"errorMessage": "There was a problem with your uploaded files. Please check the files and try again.\n" + str(error)})
				
				
				for _ in range(int(request.POST.get("player" + str(playerTurn) + "RecursionCount"))): # build tree
					myTree.nnSelectRec(myTree.root)
				print(myTree.__str__())
				board, rowNum, colNum = myTree.exploratoryMove(0) if request.POST.get("player" + str(playerTurn) + "Stochastic", False) == '' else myTree.makeMove() # set root to next move
				isSolved = board.checkWin(rowNum, colNum, myTree.root.isRedTurn)
				
			else:
				return HttpResponse("stop that")
			
			if isSolved:
				if playerTurn == '1':
					player1Score += 1
				else:
					player2Score += 1
			else:
				isDraw = board.checkDraw()
				
			if autoplay and (isDraw or isSolved):
				autoPlayCount += 1
				if autoPlayCount >= int(request.POST.get("autoPlayGames")):
					autoplay = False
					autoPlayCount = 0
			playerTurn = '1' if playerTurn == '2' else '2'
					
		else:
			dir = os.path.dirname(os.path.realpath(__file__)) + "\\userUploads"
			for item in os.listdir(dir):
				if os.path.isfile(os.path.join(dir, item)) or time.time() - os.path.getmtime(os.path.join(dir, item)) > 86400: # 24 hrs
					rmtree(os.path.join(dir, item))
			board = engine.board()
			if request.POST.get("resetGameFlag", False) == 'true': #reset board
				player1Score = request.POST.get("player1Score")
				player2Score = request.POST.get("player2Score")
				autoplay = request.POST.get('autoplay', False) == ''
				autoPlayCount = int(request.POST.get("autoPlayCount"))
				if autoplay and request.POST.get('gameResultFlag', False) == 'True':# if autoplay, alternate first move
					playerTurn = '2' if autoPlayCount % 2 else '1'
				else: #default to player 1
					playerTurn = '1'
			else: # new game
				player1Score = 0
				player2Score = 0
				autoPlayCount = 0
				autoplay = False
				playerTurn = '1'
			if request.POST.get("player1") == "Upload Neural Net" or request.POST.get("player2") == "Upload Neural Net": #verify file is valid NN, save locally, id by session
				for f in request.FILES:
					try:
						nn = tf.keras.models.load_model(request.FILES[f])
						if f[7:] == "Value":
							if nn.layers[len(nn.layers) - 1].output_shape != (None, 3):
								raise Exception('The last layer of the value network must have an output shape of (None, 3).') 
						elif f[7:] == "Policy":
							if nn.layers[len(nn.layers) - 1].output_shape != (None, 7):
								raise Exception('The last layer of the policy network must have an output shape of (None, 7).')
						if not request.session.session_key:
							request.session.create()
						dir2 = dir + "/" + request.session.session_key
						if not os.path.exists(dir2):# create dir for session if it does not exist
							os.mkdir(dir2)
						nn.save(dir2 + "/" + f)
						request.session[f] = None
					except OSError:
						return render(request, "c4nn/index.html", {"errorMessage": "There was a problem with your uploaded files. Please check the files and try again."})
					except Exception as error:
						return render(request, "c4nn/index.html", {"errorMessage": "There was a problem with your uploaded files. Please check the files and try again.\n" + str(error)})
						
		return render(request, "c4nn/takeTurn.html", {"legalMoves": board.legalMoves, "playerTurn": playerTurn, "player1": request.POST.get("player1"), "player2": request.POST.get("player2"), "isPlayerTurn": request.POST.get("player" + playerTurn) == "Human Player", "boardState": toBoardArray(board.board), "player1MinimaxDepth": request.POST.get("player1MinimaxDepth"), "player2MinimaxDepth": request.POST.get("player2MinimaxDepth"), "player1RecursionCount": request.POST.get("player1RecursionCount"), "player2RecursionCount": request.POST.get("player2RecursionCount"), "player1Stochastic": request.POST.get("player1Stochastic"), "player2Stochastic": request.POST.get("player2Stochastic"), "isSolved": isSolved, "isDraw": isDraw, "player1Score": player1Score, "player2Score": player2Score, "autoplay": autoplay, "autoPlayCount": autoPlayCount, "autoPlayGames": int(request.POST.get("autoPlayGames")) if request.POST.get("autoPlayGames", False) else 0})
	else:
		return render(request, "c4nn/index.html")
		
def backendAutoplay(request):
	play1Val, play1Pol = getNets(request, "player1")
	play2Val, play2Pol = getNets(request, "player2")
	champWins, challWins, drawCount = head2Head(False, [request.POST.get("player1Stochastic") == '', request.POST.get("player2Stochastic") == ''], "Player1", "Player2", play1Val, play1Pol, play2Val, play2Pol, int(request.POST.get("autoPlayGames")), int(request.POST.get("player1RecursionCount")), int(request.POST.get("player2RecursionCount")))
	return render(request, "c4nn/index.html", {"errorMessage": "<div class='col-md-6 col-sm-12 col-lg-4'><table class='table' style='width:50%'><tr><th colspan='2'>Final Score</th></tr><tr><td>Player 1</td><td>{}</td></tr><tr><td>Player 2</td><td>{}</td></tr><tr><td>Draws</td><td>{}</td></tr></table></div>".format(champWins, challWins, drawCount)})
	
def getNets(request, playerName):
	currPlayer = request.POST.get(playerName)
	if currPlayer == "Default Neural Net":
		return tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/models/the_value_champ"), tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/models/the_policy_champ")
	elif currPlayer == "Upload Neural Net":
		for f in request.session.keys():
			if f == playerName + "Value":
				nnVal = tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/userUploads/" + request.session.session_key + "/" + f)
			elif f == playerName + "Policy":
				nnPol = tf.keras.models.load_model(os.path.dirname(os.path.realpath(__file__)) + "/userUploads/" + request.session.session_key + "/" + f)
		return nnVal, nnPol
		
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