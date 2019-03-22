from c4nn.engine import board, cell
import c4nn.config as config, pdb, random, numpy, time
from tqdm import tqdm

class miniTree():
	def __init__(self, board, isRedTurn, maxLevel):
		self.root = miniNode(board, isRedTurn)
		miniTree.genTreeMM(self.root, -config.maxBoardVal, config.maxBoardVal, 0, maxLevel)
	
	def __str__(self, maxLevel = 100):
		return self.root.__str__(maxLevel, 0)				
				
	def genTreeMM(currNode, alpha, beta, currDepth, maxDepth):
		if currNode.rowNum and currNode.board.checkWin(currNode.rowNum, currNode.colNum, not currNode.isRedTurn):
			currNode.score = (1 if(currDepth % 2) else -1) * (config.maxBoardVal + maxDepth - currDepth)
			return currNode.score
		elif currNode.board.checkDraw():
			currNode.score = 0
			return 0
		if currDepth < maxDepth:
			currNode.score = (1 if(currDepth % 2) else -1) * config.maxBoardVal
			for colNum in currNode.board.legalMoves:
				newBoard, rowNum = currNode.board.serveNextState(colNum, currNode.isRedTurn)[:2]
				childNode = miniNode(newBoard, not currNode.isRedTurn, currNode, rowNum, colNum)
				currNode.children.append(childNode)
				retScore = miniTree.genTreeMM(childNode, alpha, beta, currDepth + 1, maxDepth)
				if currDepth % 2: #adjust alpha and beta if necessary
					if retScore < currNode.score:
						currNode.score = retScore
					if currNode.score < beta:
						beta = currNode.score
				else:
					if retScore > currNode.score:
						currNode.score = retScore
					if currNode.score > alpha:
						alpha = currNode.score
				if alpha > beta:
					return currNode.score
		else: # max depth
			currNode.setScore()
			currNode.score = currNode.score * (1 if(currDepth % 2) else -1)

		return currNode.score
		
	def getMove(self):
		# moves = [0,0,0,0,0,0,0]
		# moves[self.root.board.legalMoves[random.choice(config.maxelements(self.root.getChildScores()))]] = 1
		# return moves
		return self.root.board.legalMoves[random.choice(config.maxelements(self.root.getChildScores()))]
		
	def genGameResults(self):
		origTurn = self.root.isRedTurn
		while True:
			col = self.root.board.legalMoves[random.choice(config.maxelements(self.root.getChildScores()))]
			newBoard, row, col = self.root.board.serveNextState(col, self.root.isRedTurn)
			if newBoard.checkWin(row, col, self.root.isRedTurn):
				if origTurn == self.root.isRedTurn:
					return 1
				else:
					return -1
			elif newBoard.checkDraw():
				return 0
			self = miniTree(newBoard, not self.root.isRedTurn, config.miniMaxDefaultDepth)
				
class miniNode(config.node):
	def __init__(self, board, isRedTurn, parent = None, rowNum = None, colNum = None):
		config.node.__init__(self, board, isRedTurn, parent, rowNum, colNum)
		self.score = 0
		
	def setScore(self):
		self.score = self.scoreAlg(6, 4, 0, 1) + self.scoreAlg(3, 7, 1, 0) + self.scoreAlg(3, 4, 1, -1, True) + self.scoreAlg(3, 4, 1, 1)#row, columns, asc, desc
		if self.score > config.maxBoardVal:
			self.score = config.maxBoardVal
		elif self.score < -config.maxBoardVal:
			self.score = -config.maxBoardVal
		
	def scoreAlg(self, rowRange, colRange, rowDir, colDir, addFour = False):
		score = 0
		for colNum in range(colRange):
			for rowNum in range(rowRange):
				score -= self.iterLoop(rowNum, rowDir, colNum, colDir, addFour, not self.isRedTurn)
				score += self.iterLoop(rowNum, rowDir, colNum, colDir, addFour, self.isRedTurn)
		return score
		
	def iterLoop(self, rowNum, rowDir, colNum, colDir, addFour, isRedTurn):
		count = 0
		iterScore = 0
		for i in range(4):
			currCell = self.board.board[rowNum + rowDir * i][colNum + colDir * i + addFour * 3]
			currRow = rowNum + rowDir * i
			currCol = colNum + colDir * i + addFour * 3
			if currCell.isFilled:
				if currCell.isRed != isRedTurn:#isRed backwards?
					count += 1
				else:
					count = 0
					break
		if count < 4:
			iterScore += 2 * count
		else:
			iterScore = config.maxBoardVal
			self.isSolved = True
		return iterScore
				
	def __str__(self, maxLevel = 100, level=0):
		ret = "\t"*level + str(self.score) + "\n"
		if level < maxLevel:
			for child in self.children:
				ret += child.__str__(maxLevel, level+1)
		return ret
	
	def getChildScores(self):
		scoreList = []
		for child in self.children:
			scoreList.append(child.score)
		return scoreList

def genBoardActionPairs(sampleSize, passFn):
	simBoard = board()
	boards = []
	returnVals = []
	
	
	for _1 in tqdm(range(sampleSize)):
		isRedTurn = random.choice([True, False])
		#for _ in range(random.randint(0,15)):
		for _2 in range(random.randint(0,42)):
			simBoard, rowNum, colNum = simBoard.serveNextState(random.choice(simBoard.legalMoves), isRedTurn)
			if simBoard.checkWin(rowNum, colNum, isRedTurn) or simBoard.checkDraw():
				simBoard = board()
			isRedTurn = not isRedTurn
		myTree = miniTree(simBoard, isRedTurn, config.miniMaxDefaultDepth)
		boards.append([board(simBoard.board, simBoard.legalMoves), isRedTurn])
		returnVals.append(passFn(myTree))
	return (boards, returnVals)

# myTree = miniTree(board(), False, config.miniMaxDefaultDepth)
# print(myTree)
# print(myTree.root.getChildScores())