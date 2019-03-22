import tensorflow as tf
import numpy, c4nn.minimax as minimax, pickle, os, pdb, random, c4nn.config as config
from keras.utils import np_utils
from sklearn.preprocessing import MinMaxScaler

def getConv(boardList):
	boardArrs = []
	for board in boardList:
		boardArrs.append(numpy.concatenate((numpy.array(convGeneral(board[0].board, board[1], 0, 6, 4, 0, 1)).flatten(), numpy.array(convGeneral(board[0].board, board[1], 0, 3, 7, 1, 0)).flatten(), numpy.array(convGeneral(board[0].board, board[1], 3, 6, 4, -1, 1)).flatten() ,numpy.array(convGeneral(board[0].board, board[1], 0, 3, 4, 1, 1)).flatten()), axis = 0))
	return numpy.array(boardArrs)
	
def convGeneral(board, isRedTurn, rowStart, rowRange, colRange, rowDir, colDir):
	boardArr = []
	for row in range(rowStart, rowRange):
		rowArr = []
		for col in range(colRange):
			convVal = 0
			currColour = None
			for i in range(4):
				cell = board[row + rowDir * i][col + colDir * i]
				if cell.isFilled:
					if cell.isRed == currColour or currColour == None:
						currColour = cell.isRed
						convVal += 1 if currColour == isRedTurn else -1
					else:
						convVal = 0
						break
			rowArr.append(convVal)
		boardArr.append(rowArr)
	return numpy.array(boardArr)
	
def genData(passFn = minimax.miniTree.getMove, sampleSize = 1000, categories = 1):
	(boards, retData) = minimax.genBoardActionPairs(sampleSize, passFn)
	boards = boardListToInputs(boards)
	return numpy.array(boards), np_utils.to_categorical(retData, categories) if categories > 1 else scaleResults(retData)
		
def makeSimpleModel(model, shape, categories):
	model.add(tf.keras.layers.Flatten(input_shape=shape))
	model.add(tf.keras.layers.Dense(128, activation = tf.nn.relu))
	model.add(tf.keras.layers.Dense(128, activation = tf.nn.relu))
	model.add(tf.keras.layers.Dense(categories, activation = tf.nn.softmax))
	
def makeConvModel(model, shape, categories):
	model.add(tf.keras.layers.Conv2D(256, (4,4), input_shape = shape, padding="same"))
	model.add(tf.keras.layers.BatchNormalization())
	model.add(tf.keras.layers.Activation('relu'))
	#model.add(tf.keras.layers.MaxPooling2D(pool_size=(1,1)))
	
	model.add(tf.keras.layers.Conv2D(256, (4,4), input_shape = shape, padding = "same"))
	model.add(tf.keras.layers.BatchNormalization())
	model.add(tf.keras.layers.Activation('relu'))
	#model.add(tf.keras.layers.MaxPooling2D(pool_size=(1,1)))

	model.add(tf.keras.layers.Flatten())
	model.add(tf.keras.layers.Dense(512, activation = tf.nn.relu))
	model.add(tf.keras.layers.Dense(512, activation = tf.nn.relu))

	model.add(tf.keras.layers.Dense(categories, activation = tf.nn.softmax))
	
def boardListToInputs(boardList):
	boardArrs = []
	for board in boardList:
		boardArrs.append(boardToInputs(board[0].board, board[1]))
	return (boardArrs)
	
def boardArrayListToInputs(boardList):
	boardArrs = []
	for board in boardList:
		boardArrs.append(boardToInputs(board[0], board[1]))
	return (boardArrs)
	
def boardToInputs(board, isRedTurn):
	boardArr = []
	for rowNum in board:
		rowArr = []
		for cell in rowNum:
			#rowArr.append([cell.isFilled * (1 if cell.isRed == board[1] else -1)])# O = -1, _ = 0, X = 1
			if cell.isFilled:
				if cell.isRed == isRedTurn:
					rowArr.append([0, 1, 0])
				else:
					rowArr.append([0, 0, 1])
			else:
				rowArr.append([1, 0, 0])
		boardArr.append(rowArr)
	return boardArr
	
def getPickle(fileName, passFn, miniMaxDepth, sampleCount, outputCount):
	dir_path = os.path.dirname(os.path.realpath(__file__))
	try:
		boards = pickle.load(open(dir_path + "/pickleJar/" + fileName + "_passFN_" + passFn.__name__ + "_miniMax" + str(miniMaxDepth) + "_sampleCount" + str(sampleCount) +"_outputCount" + str(outputCount) + ".pickle", "rb"))
		retData = boards[1]
		boards = boards[0]
	except (OSError, IOError) as e:
		boards, retData = genData(passFn, sampleCount, outputCount)
		pickle.dump((boards, retData), open(dir_path + "/pickleJar/" + fileName + "_passFN_" + passFn.__name__ + "_miniMax" + str(miniMaxDepth) + "_sampleCount" + str(sampleCount) +"_outputCount" + str(outputCount) + ".pickle", "wb"))
		
	return boards, retData
	
def genMove(model, board):
	return board.getBestLegalMove(model.predict(numpy.array([boardToInputs(board.board)])).tolist()[0])
	
def getLegalMoveProbs(model, boardInputs):
	moveProbs = model.predict(numpy.array([boardInputs])).tolist()[0]
	for i in range(7):
		if i not in board.legalMoves:# set illegal move probabilites to 0
			moveProbs[i] =  0
	return moveProbs
	
def scaleResults(results):
	scaler = MinMaxScaler(feature_range = (0, 0.9999))
	return scaler.fit_transform(numpy.array(results).reshape(-1, 1))
	
	
	
	
	
	
	