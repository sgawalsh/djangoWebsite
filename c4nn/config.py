from math import sqrt

# contains configuration values that determine several import behavious of MCTS and selfplay learning functions

MCTSexploration = sqrt(2) # standard value which determines how likely a node is to be explored, given how many times it has been explored vs the rest of the tree (larger value means more likely to select unexplored nodes), results in overly greedy play for connect 4
# MCTSexploration = .5 # that's better
maxBoardVal = 100 # maximum value assigned by minimax heuristic
miniMaxDefaultDepth = 4 # depth of minimax tree
trainingRecursionCount = 100 # how many selection cycles used in MCTS
trainingSetSize = 100 # how many games are added to training set by champion each iteration
fullTrainingSetSize = 1500 # maximum games in training set
minTrainingSetSize = 200 # minimum games in training set
challengerSamples = 1000 # how many boards new challenger is trained on
batchSizeRatio = 1 / 20 # size of batch relative to samples given
challengerEpochs = 3 # how many epochs are used when generating challenger NNs
showDownSize = 50 # how many games played between challenger and champion
selfTournamentShowDownSize = 4 # games played between each generation in selfplay tournament
winRatio = 55 / 45 # ratio of wins to losses to become new champion
champArrayLength = 10 # number of former champions recorded
optimizer = 'adam' # optimizer used for all NNs
valLoss = 'sparse_categorical_crossentropy' # Loss function used for value NNs
polLoss = 'poisson' # Loss function used for Policy NNs
metrics = ['accuracy'] # Metrics displayed when fitting NNs
tempRate = .1 # Determines how quickly the MCTS becomes less exploratory
tempTurns = 5 # How many turns are executed before the MCTS starts becoming less exploratory

class node():
	def __init__(self, board, isRedTurn, parent, rowNum, colNum):
		self.parent = parent
		self.isRedTurn = isRedTurn
		self.children = []
		self.board = board
		self.rowNum = rowNum
		self.colNum = colNum
	
def maxelements(seq): # from https://stackoverflow.com/questions/3989016/how-to-find-all-positions-of-the-maximum-value-in-a-list
    # Return list of position(s) of largest element
    max_indices = []
    if seq:
        max_val = seq[0]
        for i,val in ((i,val) for i,val in enumerate(seq) if val >= max_val):
            if val == max_val:
                max_indices.append(i)
            else:
                max_val = val
                max_indices = [i]

    return max_indices
	
def getResponseFromList(question, answers):
	while True:
		data = input(question + " " + str(answers) + "\n> ")
		if data:
			if data in answers:
				return data
			else:
				print("Please choose an option from the list")

def getIntResponse(question):
	while True:
		try:
			i = int(input(question + "\n> "))
			if i <= 0:
				print("Value out of range")
			else:
				return i
		except ValueError:
			print("Please enter an integer.")