const express = require("express");

const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const GameState = require("./states/GameState");

app.use(cors());

const server = http.createServer(app);


// Serve static assets in production
if (process.env.NODE_ENV === "production") {
    //Set static folder
    app.use(express.static("client/build"));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

const connectedUsers = new Map();
const games = {}; // Key: roomId, Value: GameState instance

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const userId = socket.id;

  connectedUsers.set(userId, socket);

  console.log(
    `User Connected: ${socket.id}, Total users: ${connectedUsers.size}`
  );





  socket.on("join_game", async (data) => {
    try {
        const roomId = data.roomId;

    const userAddress = data.userAddress;
    const connectedSockets = io.sockets.adapter.rooms.get(roomId);
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );

    // check if user is connected to more than one room and check to see if there are already 2 users in the requested room
    if (
      socketRooms.length > 0 ||
      (connectedSockets && connectedSockets.size === 2)
    ) {
      socket.emit("room_join_error", {
        error: "Room is full please choose another room to play",
      });
    } else {
      
      
      // Initialize GameState here if it doesn't exist
      if (!games[roomId]) {
        games[roomId] = new GameState(roomId);
      }
        // check to see if the game is already being played by two players
        const isGameFull = Object.keys(games[roomId].players)?.length > 1
      if(isGameFull){
        // check to see if the player is involved already in the game(reconnection)
        const isInvolved = games[roomId].players[userAddress]
        if(isInvolved){
            games[roomId].addPlayer(userAddress, socket.id);
            socket.emit("room_joined");
            await socket.join(roomId);
            await new Promise((res)=> {
                setInterval(()=> {
                    res()
                }, 750)
            })
            connectedUsers.set(userId, { socket, roomId, userAddress });
            const symbol = games[roomId].getSymbol(userAddress);
            const symbolOther = games[roomId].getOtherPlayerSymbol(userAddress);
            socket.emit("on_resume_game", {
                matrix: games[roomId].matrix,
                symbol: symbol,
              });
              socket.to(roomId).emit("on_resume_game", {
                matrix: games[roomId].matrix,
                symbol: symbolOther,
              });



              const currentTurn = games[roomId].getCurrentTurnUserAddress();
              const currentTurnSocketId = games[roomId].getSocketId(currentTurn);
              const nonCurrentTurnSocketId =
                games[roomId].getOtherPlayerSocketId(currentTurn);
              io.to(currentTurnSocketId).emit("on_turn_update", true);
              io.to(nonCurrentTurnSocketId).emit("on_turn_update", false);
              return
        } else {
            //TODO: send back error that the user cannot join the game
            return
        }
      } else {

        await socket.join(roomId);
       connectedUsers.set(userId, { socket, roomId, userAddress });

      }
      games[roomId].addPlayer(userAddress, socket.id);
      socket.emit("room_joined");
      const players = games[roomId].getPlayers();

      console.log('getplay', players)
      

      setTimeout(() => {
        io.in(roomId).emit('on_players_info', players)
        if (io.sockets.adapter.rooms.get(roomId)?.size === 2) {
          // Emit to the current socket/client that joined last
          const symbol = games[roomId].getSymbol(userAddress);
          socket.emit("start_game", {
            start: symbol === "x" ? true : false,
            symbol: symbol,
          });
          const symbolOther = games[roomId].getOtherPlayerSymbol(userAddress);
          // Emit to all clients in the room, except the sender
          socket.to(roomId).emit("start_game", {
            start: symbolOther === "x" ? true : false,
            symbol: symbolOther,
          });
        }
      }, 1000);
    }
    } catch (error) {
        console.error(error)
    }
  });

  const getSocketGameRoom = (socket) => {
    const socketRooms = Array.from(socket.rooms.values()).filter(
      (r) => r !== socket.id
    );
    const gameRoom = socketRooms && socketRooms[0];
    return gameRoom;
  };

  socket.on("update_game", async (data) => {
    try {
        console.log({ data });
    const gameRoom = getSocketGameRoom(socket);
    const { column, row, symbol } = data.matrix;
    const user = connectedUsers.get(socket.id);
    const roomId = user ? user.roomId : null;
    const userAddress = user ? user.userAddress : null;
    const { status, matrix, players } = games[roomId].updateGameMatrix(
      column,
      row,
      userAddress
    );
    console.log({ status, matrix });

    const currentTurn = games[roomId].getCurrentTurnUserAddress();
      const currentTurnSocketId = games[roomId].getSocketId(currentTurn);
      const nonCurrentTurnSocketId =
        games[roomId].getOtherPlayerSocketId(currentTurn);

    if (status === "new_turn") {
      // socket.to(gameRoom).emit("on_game_update", matrix)
      
      io.to(currentTurnSocketId).emit("on_game_update", matrix);
      io.to(nonCurrentTurnSocketId).emit("on_game_update", matrix);
      io.to(currentTurnSocketId).emit("on_turn_update", true);
      io.to(nonCurrentTurnSocketId).emit("on_turn_update", false);
    } else if (status === "tie") {
        io.to(currentTurnSocketId).emit("on_game_tie", {matrix, players});
      io.to(nonCurrentTurnSocketId).emit("on_game_tie", {matrix, players});
    } else if (status === "win") {
        io.to(currentTurnSocketId).emit("on_game_win", {matrix, players});
      io.to(nonCurrentTurnSocketId).emit("on_game_win", {matrix, players});
    }
    if(status === 'win' || status === 'tie'){

        // end game ( later save to db )
        delete games[roomId]

    }
    } catch (error) {
        console.error(error)
    }
  });



  const handleWinner = (roomId) => {
    // Use `io.to(roomId).emit(...)` to notify the room, assuming `io` is in scope
    socket.to(roomId).emit("on_game_win", {});
  };
  socket.on("disconnect", () => {
   try {
    const user = connectedUsers.get(socket.id);
    const roomId = user ? user.roomId : null;
    const userAddress = user ? user.userAddress : null;
    connectedUsers.delete(userId);

    console.log({ roomId });
    if (roomId && userAddress && games[roomId]) {
      games[roomId].handleDisconnect(userAddress, () => handleWinner(roomId));

      // Optionally, notify the other player in the room about the disconnection
    //   socket.to(roomId).emit("player_disconnected", { userAddress });
    const players = games[roomId].getPlayers();
    io.in(roomId).emit('on_players_info', players)
    }
    console.log(
      `User disconnected: ${userId}. Total users: ${connectedUsers.size}`
    );
   } catch (error) {
    console.error(error)
   }
  });
});


server.listen(3001, () => {
  console.log("server is running");
});
