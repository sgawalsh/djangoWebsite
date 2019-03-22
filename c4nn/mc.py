from c4nn.engine import board, cell
import pdb, random, math, c4nn.config as config, c4nn.NNfunctions as NNfunctions, numpy, tensorflow as tf
from tqdm import tqdm

class monteTree():
	#select node, generate child nodes with legal moves, run random simulations on each node, backpropagate with results
	def __init__(self, board, isRedTurn, polModel = None, valModel = None, randomExpand = False):
		self.root = monteNode(board, isRedTurn)
		self.polModel = polModel
		self.valModel = valModel
		if self.polModel:
			self.root.nnVal = (self.valModel.predict(numpy.array([NNfunctions.boardToInputs(self.root.board.board, self.root.isRedTurn)]))).tolist()[0][1]
			self.nnExpand(self.root)
		else:
			self.expand(self.root, randomExpand)
		
	def __repr__(self):
		return "<tree representation>"
		
	def __str__(self, maxLevel = 100):
		return self.root.__str__(0, maxLevel, 0)
	
	def expand(self, parentNode, randomExpand):
		if not randomExpand:
			model = tf.keras.models.load_model("models/the_simple_champ")
		for colNum in parentNode.board.legalMoves:
			childNode = monteNode(parentNode.board.serveNextState(colNum, parentNode.isRedTurn)[0], not parentNode.isRedTurn, parentNode)
			parentNode.children.append(childNode)
			simBoard = childNode.board
			isRedTurn = childNode.isRedTurn
			while True:
				# simBoard.printBoard()
				# pdb.set_trace()
				simBoard, rowNum, colNum  = simBoard.serveNextState(random.choice(simBoard.legalMoves) if randomExpand else NNfunctions.genMove(model, simBoard), isRedTurn)
				if simBoard.checkWin(rowNum, colNum, isRedTurn):
					monteTree.backProp(childNode, isRedTurn, True)
					break
				elif simBoard.checkDraw():
					monteTree.backProp(childNode, isRedTurn, False)
					break
		parentNode.expanded = True
		
	def nnExpand(self, parentNode):
		boardInputs = NNfunctions.boardToInputs(parentNode.board.board, parentNode.isRedTurn)
		#pdb.set_trace()
		moveProbs = (self.polModel.predict(numpy.array([boardInputs]))).tolist()[0]
		#parentNode.nnVal = (self.valModel.predict(numpy.array([boardInputs]))).tolist()[0][1]#[0] if 1 cat, [0][1] if 3 cat move to tree __init__
		for colNum in parentNode.board.legalMoves:
			newBoard, childRow, childCol = parentNode.board.serveNextState(colNum, parentNode.isRedTurn)
			childNode = monteNode(newBoard, not parentNode.isRedTurn, parentNode, moveProbs[colNum], childRow, childCol)
			nnVal = 0
			if childNode.board.checkWin(childNode.rowNum, childNode.colNum, not childNode.isRedTurn):
				nnVal = 1
				childNode.boardCompleted = True
				childNode.isWin = True
			elif parentNode.board.checkDraw():
				nnVal = 0.5
				childNode.boardCompleted = True
			else:
				nnVal = (self.valModel.predict(numpy.array([NNfunctions.boardToInputs(newBoard.board, childNode.isRedTurn)]))).tolist()[0][1]
			parentNode.children.append(childNode)
			monteTree.nnBackProp(childNode, childNode.isRedTurn, nnVal)
		parentNode.expanded = True
		
	def selectRec(self, node):
		if node.expanded:
			valList = []
			for child in node.children:
				valList.append((child.num / child.den) + config.MCTSexploration * math.sqrt(math.log(self.root.den) / child.den))
			return self.selectRec(node.children[random.choice(config.maxelements(valList))])
		else:
			self.expand(node, False)
			return node
			
	def nnSelectRec(self, node):
		if node.boardCompleted:
			monteTree.nnBackProp(node, node.isRedTurn, 1 if node.isWin else .5)
			return node
		elif node.expanded and node.children:
			valList = []
			for child in node.children:
				valList.append((child.nnVal / child.den) + config.MCTSexploration * math.sqrt(math.log(child.nnProb + self.root.den) / child.den))
			return self.nnSelectRec(node.children[random.choice(config.maxelements(valList))])
		else:
			self.nnExpand(node)
			return node
			
	def backProp(currNode, isRedTurn, isWin):
		if isWin and currNode.isRedTurn != isRedTurn:
			currNode.num += 1
		elif not isWin:
			currNode.num += 0.5
			
		currNode.den += 1
				
		if currNode.parent:
			monteTree.backProp(currNode.parent, isRedTurn, isWin)
			
	def nnBackProp(currNode, isRedTurn, nnVal):
		if currNode.isRedTurn == isRedTurn:
			currNode.nnVal += nnVal
		currNode.den += 1
		if currNode.parent:
			monteTree.nnBackProp(currNode.parent, isRedTurn, nnVal)
			
	def makeMove(self, resetRoot = False):
		if self.root.children:
			valList = []
			for child in self.root.children:
				valList.append(child.den)
			moveChoice = self.root.children[random.choice(config.maxelements(valList))]
			if resetRoot:
				self.root = moveChoice
			else:
				return moveChoice.board, moveChoice.rowNum, moveChoice.colNum
		else:
			raise Exception('The node has no children.')
				
		
class monteNode(config.node):
	def __init__(self, board, isRedTurn, parent = None, nnProb = 0, rowNum = 0, colNum = 0):
		config.node.__init__(self, board, isRedTurn, parent, rowNum, colNum)
		self.num = 0
		self.den = 0
		self.nnProb = nnProb
		self.nnVal = 0
		self.expanded = False
		self.boardCompleted = False
		self.isWin = False
		
	def __str__(self, colNum, maxLevel = 100, level=0):
		ret = "\t"*level + "(" + str(colNum) + ") " + str(self.nnVal)[:4] + " / " + str(self.den) +"\n"
		if level < maxLevel:
			for childCol in range(len(self.children)):
				ret += self.children[childCol].__str__(childCol, maxLevel, level+1)
		return ret
	
# valModel = tf.keras.models.load_model("models/value3cat/simple/the_value_champ")
# polModel = tf.keras.models.load_model("models/policy/simple/the_simple_champ")
# myTree = monteTree(board(), True, polModel, valModel, False)
# for _ in tqdm(range(config.trainingRecursionCount)):
	# selectNode = myTree.nnSelectRec(myTree.root)
	
# print(myTree.root.__str__(1))