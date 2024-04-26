class GameState {
  constructor(roomId) {
    this.roomId = roomId;
    this.board = this.initializeBoard();
    this.players = {
      /* player details including isConnected flags and symbols and hasWon */
    };
    this.currentTurn = "x"; // or 'o'
    this.gameOver = false;
    this.disconnectionTimer = null;
    this.matrix = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  addPlayer(userAddress, socketId) {
    // Add or update player in the game
   
    if (!this.players[userAddress]) {
        console.log('this.players', this.players)
        let symbol = this.assignRandomSymbol()
        if(Object.keys(this.players).length > 0){
            const key = Object.keys(this.players)[0]
            console.log({key})
           const otherSymbol = this.players[key].symbol
           symbol = otherSymbol === 'o' ? 'x': 'o'
        }
      this.players[userAddress] = { isConnected: true, symbol, socketId };
    } else {
      // Handle reconnection
      //   this.players[userAddress].isConnected = true;
      this.handleReconnect(userAddress, socketId);
    }
    // Additional logic for handling player addition...
  }

  getPlayers(){
    let players = {}
    console.log('players2', this.players)
    Object.keys(this.players).forEach(player => {
        const value = structuredClone(this.players[player]);
        delete value.socketId
        players[player] = value
    })
    return players
  }

  initializeBoard() {
    /* Initialize game board */
  }

  makeMove(playerId, column) {
    /* Handle player move */
  }

  checkWin() {
    /* Check for win conditions */
  }

  assignRandomSymbol() {
    // Generate a random number between 0 and 1
    const randomNumber = Math.random();
    
    // If the number is less than 0.5, assign "x", otherwise assign "o"
    return randomNumber < 0.5 ? 'x' : 'o';
  }

  handleDisconnect(playerId, onGameWin) {
    console.log({ playerId });
    // Mark player as disconnected and start timeout if not already started
    if (!this.disconnectionTimer) {
      this.startDisconnectionTimeout(onGameWin);
    }
    this.players[playerId].isConnected = false;
  }

  handleReconnect(playerId, socketId) {
    // Cancel timeout and mark player as reconnected
    clearTimeout(this.disconnectionTimer);
    this.disconnectionTimer = null;
    this.players[playerId].isConnected = true;
    this.players[playerId].socketId = socketId
  }

  isBothDisconnected() {
    return Object.values(this.players).every((player) => !player.isConnected);
  }

  startDisconnectionTimeout(onGameWin) {
    this.disconnectionTimer = setTimeout(() => {
      if (this.isBothDisconnected()) {
        // If both players are disconnected, consider removing the game
        console.log(
          "Both players disconnected. Game can be ended and removed."
        );

        // delete games[this.roomId]; 
        // Assuming 'games' is your global storage of game sessions
      } else {
        console.log("hello only 1");
        onGameWin();
        // Logic for when only one player is disconnected after the timeout
      }
    }, 30000); // 1-minute timeout
  }

  checkGameState(matrix, playerSymbol){
    for (let i = 0; i < matrix.length; i++) {
      let row = [];
      for (let j = 0; j < matrix[i].length; j++) {
        row.push(matrix[i][j]);
      }

      if (row.every((value) => value && value === playerSymbol)) {
        return [true, false];
      } else if (row.every((value) => value && value !== playerSymbol)) {
        return [false, true];
      }
    }

    for (let i = 0; i < matrix.length; i++) {
      let column = [];
      for (let j = 0; j < matrix[i].length; j++) {
        column.push(matrix[j][i]);
      }

      if (column.every((value) => value && value === playerSymbol)) {
        return [true, false];
      } else if (column.every((value) => value && value !== playerSymbol)) {
        return [false, true];
      }
    }

    if (matrix[1][1]) {
      if (matrix[0][0] === matrix[1][1] && matrix[2][2] === matrix[1][1]) {
        if (matrix[1][1] === playerSymbol) return [true, false];
        else return [false, true];
      }

      if (matrix[2][0] === matrix[1][1] && matrix[0][2] === matrix[1][1]) {
        if (matrix[1][1] === playerSymbol) return [true, false];
        else return [false, true];
      }
    }

    //Check for a tie
    if (matrix.every((m) => m.every((v) => v !== null))) {
      return [true, true];
    }

    return [false, false];
  };

  getSymbol(userAddress){
    return this.players[userAddress].symbol
  }
  getCurrentTurn(){
    return this.currentTurn
  }
  getCurrentTurnUserAddress(){
    let userAddress
    Object.keys(this.players).forEach((user)=> {
        const values = this.players[user]
        if(values.symbol === this.currentTurn){
            userAddress = user
        }
    })
    return userAddress
  }
  getOtherPlayerSymbol(userAddress){
    let otherPlayer
    Object.keys(this.players).forEach((user)=> {
        if(user !== userAddress){
            otherPlayer = user
        }
    })
    return this.players[otherPlayer].symbol
  }
  getSocketId(userAddress){
    console.log('this.players', this.players, userAddress)
    return this.players[userAddress].socketId
  }
  getOtherPlayerSocketId(userAddress){
    let otherPlayer
    Object.keys(this.players).forEach((user)=> {
        if(user !== userAddress){
            otherPlayer = user
        }
    })
    return this.players[otherPlayer].socketId
  }
  getOtherPlayer(userAddress){
    let otherPlayer
    Object.keys(this.players).forEach((user)=> {
        if(user !== userAddress){
            otherPlayer = user
        }
    })
    return otherPlayer
  }


  updateGameMatrix(column, row, userAddress){
    console.log({column,row,userAddress, currentTurn: this.currentTurn})
    const currentPlayerSymbol = this.getSymbol(userAddress)
    console.log({currentPlayerSymbol})
    if(this.currentTurn !== currentPlayerSymbol) return {status: 'not-turn'}
    const symbol = this.players[userAddress].symbol
    const newMatrix = [...this.matrix];

    if (newMatrix[row][column] === null || newMatrix[row][column] === "null") {
      newMatrix[row][column] = symbol;
     this.matrix = newMatrix
     this.currentTurn = this.getOtherPlayerSymbol(userAddress)
    }

    const [currentPlayerWon, otherPlayerWon] = this.checkGameState(newMatrix, symbol);
    const updatePlayers = structuredClone(this.players)
    if (currentPlayerWon && otherPlayerWon) {
        // gameService.gameWin(socketService.socket, "The Game is a TIE!");
        
        Object.keys(updatePlayers).forEach((player)=> {

            updatePlayers[player].hasWon = true
            delete updatePlayers[player].socketId
        })
       
        return {status: "tie" , matrix: this.matrix, players: updatePlayers}
      } else if (currentPlayerWon || otherPlayerWon) {
        const winnerUserAddress = currentPlayerWon ? userAddress : this.getOtherPlayer(userAddress);
        Object.keys(updatePlayers).forEach((player)=> {
            if(player === winnerUserAddress){
                updatePlayers[player].hasWon = true
            } else {
                updatePlayers[player].hasWon = false
            }
            
            delete updatePlayers[player].socketId
        })
        // gameService.gameWin(socketService.socket, "You Lost!");
        return {status: "win" , matrix: this.matrix, players: updatePlayers}
      }
      return {status: "new_turn" , matrix: this.matrix, currentTurn: this.currentTurn}
      // The person's turn
  }
}

module.exports = GameState;
