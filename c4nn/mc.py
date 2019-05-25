from c4nn.engine import board, cell
import pdb, random, math, c4nn.config as config, c4nn.NNfunctions as NNfunctions, numpy, tensorflow as tf
from tqdm import tqdm

class monteTree(): #monte tree class, can function with and without neural nets

	def __init__(self, board, isRedTurn, polModel = None, valModel = None, randomExpand = False):
		self.root = monteNode(board, isRedTurn)
		self.polModel = polModel
		self.valModel = valModel
		if self.valModel and self.polModel:# using neural nets
			self.root.nnVal = genNNVal((self.valModel.predict(numpy.array([NNfunctions.boardToInputs(self.root.board.board, self.root.isRedTurn)]))).tolist()[0])
			self.nnExpand(self.root)
		else: # using monte carlo random move method
			self.expand(self.root, randomExpand)
	
	def __repr__(self):
		return "<tree representation>"
	
	def __str__(self, maxLevel = 100):
		return self.root.__str__(0, maxLevel, 0)
	
	def nnSelectRec(self, node): # drill through tree until unexpanded node is reached, expand and backpropagate values through tree
		if node.boardCompleted:
			monteTree.nnBackProp(node, node.isRedTurn, 1 if node.isWin else .5)
			return node
		elif node.expanded:
			valList = []
			for child in node.children: # for each child, generate value according to assigned values, and traversal count
				valList.append((child.nnVal / child.den) + config.MCTSexploration * child.nnProb * math.sqrt(self.root.den) / (1 + child.den))
			self.nnSelectRec(node.children[random.choice(config.maxelements(valList))]) # call fn recursively on node with largest value
		else:
			self.nnExpand(node)

	def nnExpand(self, parentNode): # create child node for each legal move, get value if board is an end state, or use NN to generate a value, backprop for each new child
		moveProbs = (self.polModel.predict(numpy.array([NNfunctions.boardToInputs(parentNode.board.board, parentNode.isRedTurn)]))).tolist()[0] # use policy NN to get initial move probabilities
		for colNum in parentNode.board.legalMoves: # create child node for each legal move
			newBoard, childRow, childCol = parentNode.board.serveNextState(colNum, parentNode.isRedTurn)
			childNode = monteNode(newBoard, not parentNode.isRedTurn, parentNode, moveProbs[colNum], childRow, childCol)
			if childNode.board.checkWin(childNode.rowNum, childNode.colNum, not childNode.isRedTurn):
				nnVal = 1
				childNode.boardCompleted = True
				childNode.isWin = True
			elif childNode.board.checkDraw():
				nnVal = 0.5
				childNode.boardCompleted = True
			else:
				nnVal = genNNVal((self.valModel.predict(numpy.array([NNfunctions.boardToInputs(newBoard.board, childNode.isRedTurn)]))).tolist()[0]) # use value NN to get board value
			parentNode.children.append(childNode)
			monteTree.nnBackProp(childNode, childNode.isRedTurn, nnVal) # backprop for each new child
		parentNode.expanded = True
		
	def nnBackProp(currNode, isRedTurn, nnVal): # backpropagate  values back through tree
		if currNode.isRedTurn == isRedTurn: # adjust value of boards with same player turn
			currNode.nnVal += nnVal
		currNode.den += 1
		if currNode.parent: # call recursively until root is reached
			monteTree.nnBackProp(currNode.parent, isRedTurn, nnVal)
	
	def expand(self, parentNode, randomExpand):
		if not randomExpand:
			model = tf.keras.models.load_model("models/the_simple_champ")
		for colNum in parentNode.board.legalMoves:
			childNode = monteNode(parentNode.board.serveNextState(colNum, parentNode.isRedTurn)[0], not parentNode.isRedTurn, parentNode)
			parentNode.children.append(childNode)
			simBoard = childNode.board
			isRedTurn = childNode.isRedTurn
			while True:
				simBoard, rowNum, colNum  = simBoard.serveNextState(random.choice(simBoard.legalMoves) if randomExpand else NNfunctions.genMove(model, simBoard), isRedTurn)
				if simBoard.checkWin(rowNum, colNum, isRedTurn):
					monteTree.backProp(childNode, isRedTurn, True)
					break
				elif simBoard.checkDraw():
					monteTree.backProp(childNode, isRedTurn, False)
					break
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
			
	def backProp(currNode, isRedTurn, isWin):
		if isWin and currNode.isRedTurn != isRedTurn:
			currNode.num += 1
		elif not isWin:
			currNode.num += 0.5
			
		currNode.den += 1
				
		if currNode.parent:
			monteTree.backProp(currNode.parent, isRedTurn, isWin)
	
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
	
	def getMoveProbs(self):
		moveProbs = []
		childCount = 0
		for i in range(7):
			if i in self.root.board.legalMoves:
				moveProbs.append(self.root.children[childCount].den)
				childCount += 1
			else:
				moveProbs.append(0)
		moveProbs = numpy.array(moveProbs)
		return moveProbs / moveProbs.sum()
		
	def exploratoryMove(self, temp):
		if self.root.children:
			valList = []
			for child in self.root.children:
				valList.append(child.den ** (1 / (1 - temp)))
			#pdb.set_trace()
			valList = numpy.array(valList)
			moveChoice = numpy.random.choice(self.root.children, p = valList / valList.sum())
			return moveChoice.board, moveChoice.rowNum, moveChoice.colNum
		else:
			raise Exception('The node has no children.')
	
	def turnCountToTemp(turnCount):
		turnCount -= config.tempTurns
		return (0 if turnCount <=0 else turnCount * config.tempRate)
	
class monteNode(config.node):
	def __init__(self, board, isRedTurn, parent = None, nnProb = 0, rowNum = 0, colNum = 0):
		config.node.__init__(self, board, isRedTurn, parent, rowNum, colNum)
		self.num = 0 # not used in neural net fns, replaced by nnVal
		self.den = 0
		self.nnProb = nnProb
		self.nnVal = 0
		self.expanded = False
		self.boardCompleted = False
		self.isWin = False
	
	def __str__(self, colNum, maxLevel = 100, level=0):
		ret = "\t" * level + "(" + str(colNum) + ") P:" + str(self.nnProb)[:4] + " V:" + str(self.nnVal)[:4] + " / " + str(self.den) +"\n"
		if level < maxLevel:
			for childCol in range(len(self.children)):
				ret += self.children[childCol].__str__(childCol, maxLevel, level+1)
		return ret
		
def genNNVal(inList): # return draw probability * .5 + win probability
	return 0.5 * inList[1] + inList[2]