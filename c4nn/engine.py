import pdb, c4nn.config, random

class board:

	def __init__(self, prevBoard = None, legalMoves = None):
		self.board = []
		if prevBoard: #copy existing
			self.legalMoves = legalMoves.copy()
			for row in range(6):
				newRow = []
				for col in range(7):
					newCell = cell(prevBoard[row][col].isFilled, prevBoard[row][col].isRed)
					newRow.append(newCell)
				self.board.append(newRow)
		else: #initial board
			self.legalMoves = [0,1,2,3,4,5,6]
			for row in range(6):
				newRow = []
				for col in range(7):
					newRow.append(cell())
				self.board.append(newRow)
		
	def printBoard(self):
		for row in self.board:
			rowString = ""
			for cell in row:
				if cell.isFilled:
					if cell.isRed:
						rowString += 'X '
					else:
						rowString += 'O '
				else:
					rowString += '_ '
			print(rowString)
		print("\n")
		
	def dropPiece(self, colNum, isRed):
		if self.board[0][colNum].isFilled:
			print("Column already full")
			return - 1
		else:
			for i in range (1, 6):
				if self.board[i][colNum].isFilled:
					self.board[i - 1][colNum].isFilled = True
					self.board[i - 1][colNum].isRed = isRed
					return i - 1
			self.board[i][colNum].isFilled = True
			self.board[i][colNum].isRed = isRed
			return i
	
	def serveNextState(self, colNum, isRed):
		retBoard = board(self.board, self.legalMoves)
		placed = False
		for i in range(5):
			if retBoard.board[i + 1][colNum].isFilled:
				retBoard.board[i][colNum].isFilled = True
				retBoard.board[i][colNum].isRed = isRed
				rowNum = i
				if not i:
					retBoard.legalMoves.remove(colNum)
				placed = True
				break
		
		if not placed:
			retBoard.board[5][colNum].isFilled = True
			retBoard.board[5][colNum].isRed = isRed
			rowNum = 5
			
		return retBoard, rowNum, colNum
	
	def clearSpace(self, row, col):
		self.board[row][col].isFilled = False
		self.board[row][col].isRed = False
	
	def getRowNum(self, colNum):
		for rowNum in range(5):
			if self.board[rowNum + 1][colNum].isFilled:
				return rowNum
		return 5
	
	def checkWin(self, row, col, isRed):
		if self.checkHori(row, col, isRed) or self.checkVert(row, col, isRed) or self.checkDiagAsc(row, col, isRed) or self.checkDiagDesc(row, col, isRed):
			return True
		else:
			return False
		
	def checkHori(self, row, col, isRed):
		for i in range(4):
			isSolved = True
			if (col - i + 3) < 7 and (col - i >= 0):
				for j in range(4):
					if not self.board[row][col - i + j].isFilled or self.board[row][col - i + j].isRed != isRed:
						isSolved = False
						break
				if isSolved:
					return True
		return False
		
	def checkVert(self, row, col, isRed):
		for i in range(4):
			isSolved = True
			if (row - i + 3) < 6 and (row - i >= 0):
				for j in range(4):
					if not self.board[row - i + j][col].isFilled or self.board[row - i + j][col].isRed != isRed:
						isSolved = False
						break
				if isSolved:
					return True
		return False
		
	def checkDiagAsc(self, row, col, isRed):
		for i in range(4):
			isSolved = True
			if (row + i - 3) >= 0 and (row + i) < 6 and (col - i + 3) < 7 and (col - i >= 0):
				for j in range(4):
					if not self.board[row + i - j][col - i + j].isFilled or self.board[row + i - j][col - i + j].isRed != isRed:
						isSolved = False
						break
				if isSolved:
					return True
		return False
		
	def checkDiagDesc(self, row, col, isRed):
		for i in range(4):
			isSolved = True
			if (row - i + 3) < 6 and (row - i >= 0) and (col - i + 3) < 7 and (col - i >= 0):
				for j in range(4):
					if not self.board[row - i + j][col - i + j].isFilled or self.board[row - i + j][col - i + j].isRed != isRed:
						isSolved = False
						break
				if isSolved:
					return True
		return False
		
	def checkDraw(self):
		for colNum in range(7):
			if not self.board[0][colNum].isFilled:
				return False
		return True
		
	def getBestLegalMove(self, moveProbs):
		while True:
			choice = random.choice(config.maxelements(moveProbs))
			if choice in self.legalMoves:
				return choice
			else:
				moveProbs[choice] = 0
			
class cell:
	def __init__(self, isFilled = False, isRed = False):
		self.isFilled = isFilled
		self.isRed = isRed
		
def runGame():
	myBoard = board()

	gameOver = False
	isRedTurn = True

	while (not gameOver):
		colNum = int(input("Which column will you play? "))
		rowNum = myBoard.dropPiece(colNum, isRedTurn)
		myBoard.printBoard()
		if myBoard.checkWin(rowNum, colNum, isRedTurn):
			print("The game was won by someone!!! I don't know who though.")
			gameOver = True
		elif myBoard.checkDraw():
			print("It's a draw!")
			gameOver = True
		else:
			isRedTurn = not isRedTurn