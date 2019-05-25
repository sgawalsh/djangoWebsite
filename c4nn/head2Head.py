import c4nn.mc as mc, c4nn.engine as engine, c4nn.config as config, pdb
from tqdm import tqdm

def head2Head(isSelfPlayShowDown, exploratoryFlags, name1, name2, champVal, champPol, challVal, challPol, showDownSize, trainingRecursionCount1, trainingRecursionCount2 = None): # play selected amount of games between two models, return win counts
	if trainingRecursionCount2 == None:
		trainingRecursionCount2 = trainingRecursionCount1
	challWins = 0
	drawCount = 0
	champWins = 0
	# showTree = False
	# showBoard = True
	# treeDepth = 2
	
	print("Showdown!!!")
	for _ in tqdm(range(showDownSize)):
		isRedTurn = _ % 2 == 0 # toggle first move
		currBoardState = engine.board()
		turnCount = 0
		while True:
			currPlayer = mc.monteTree(currBoardState, True, champPol, champVal) if isRedTurn else mc.monteTree(currBoardState, False, challPol, challVal)
			for _2 in range(trainingRecursionCount1 if isRedTurn else trainingRecursionCount2):
				currPlayer.nnSelectRec(currPlayer.root)
			# if showTree:
				# print(currPlayer.__str__(treeDepth))
			temp = mc.monteTree.turnCountToTemp(turnCount) if exploratoryFlags[0] and isRedTurn or exploratoryFlags[1] and not isRedTurn else 1
			if temp < 1:
				currBoardState, rowNum, colNum = currPlayer.exploratoryMove(temp)
			else:
				currBoardState, rowNum, colNum = currPlayer.makeMove()
			# if showBoard:
				# currBoardState.printBoard()
			# pdb.set_trace()
			if currBoardState.checkWin(rowNum, colNum, isRedTurn):
				if isRedTurn:
					print("\n" + name1 + " wins!")
					champWins += 1
				else:
					print("\n" + name2 + " wins!")
					challWins += 1
				break
			elif currBoardState.checkDraw():
				print("\nDraw!")
				drawCount += 1
				break
			else:
				isRedTurn = not isRedTurn
				turnCount += 1
		print('''	Current Stats:
		{} Wins: {}
		{} Wins: {}
		Draws: {}'''.format(name1, champWins, name2, challWins, drawCount))
		if isSelfPlayShowDown:
			if ((champWins) * config.winRatio) > (showDownSize - champWins - drawCount):
				print("Challenger victory no longer possible. Ending showdown.")
				break
			elif ((challWins) / config.winRatio) > (showDownSize - challWins - drawCount):
				print("Challenger wins! Ending showdown.")
				break
	print('''	End Stats:
		Games Played: {}
		{} Wins: {}
		{} Wins: {}
		Draws: {}'''.format(champWins + challWins + drawCount, name1, champWins, name2, challWins, drawCount))
		
	return champWins, challWins, drawCount