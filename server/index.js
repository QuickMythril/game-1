const express = require("express");
const path = require("path");

const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const GameState = require("./states/GameState");
const connectDB = require("./db");
const User = require("./models/User");
const Game = require("./models/Game");
const mongoose = require("mongoose");
const ShortUniqueId = require("short-unique-id");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

connectDB();
const uid = new ShortUniqueId({ length: 16 });

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use("/api/game", require("./api/game")(io));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/dist")));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const connectedUsers = new Map();
const games = {}; // Key: roomId, Value: GameState instance
let waitingList = [];
console.log("process.env.CORS_ORIGIN", process.env.CORS_ORIGIN);

const getFullGame = async (roomId)=> {
    try {
        const fullGame  = await Game.findOne({ roomId })
        .populate({
          path: 'players', // Populate all players
          select: 'qortAddress' // Select only the qortAddress field from the User model
        })
        .populate({
          path: 'playerPayments.player', // Populate player field within playerPayments
          select: 'qortAddress' // Select only the qortAddress field from the User model
        })
        .populate({
          path: 'history.winner', // Populate the winner in the history if available
          select: 'qortAddress' // Select only the qortAddress field
        })
        .populate({
          path: 'winner', // Populate the overall game winner if available
          select: 'qortAddress' // Select only the qortAddress field
        })
        .populate({
          path: 'series.scores.player', // Populate players within the scores of series
          select: 'qortAddress' // Select only the qortAddress field
        });
        return fullGame
    } catch (error) {
        
    }
}

io.on("connection", (socket) => {
  const userId = socket.id;

  connectedUsers.set(userId, socket);

  console.log(
    `User Connected: ${socket.id}, Total users: ${connectedUsers.size}`
  );

  socket.on("generate_game", async (data) => {
    try {
      console.log("generate_game", waitingList);
      const userAddress = data.userAddress;
      if (!userAddress) return;
      if (waitingList.length > 0) {
        const findExistingRoom = waitingList.find(
          (item) => item?.userAddress === userAddress
        );
        console.log({ findExistingRoom });
        if (findExistingRoom) {
          socket.emit("on_generate_game_response", {
            roomId: findExistingRoom.roomId,
          });
          return;
        }
        const test = waitingList[0].roomId;
        console.log({ test });
        socket.emit("on_generate_game_response", {
          roomId: waitingList[0].roomId,
        });
        waitingList.shift();
        waitingList = waitingList.filter(
          (item) => item.userAddress !== userAddress
        );
      } else {
        const id = uid.rnd();
        waitingList.push({
          roomId: id,
          userAddress,
        });
        socket.emit("on_generate_game_response", {
          roomId: id,
        });
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("join_game", async (data) => {
    try {
      const roomId = data.roomId;
      let game = await Game.findOne({ roomId });
      if (game && game.status === "finished") {
        socket.emit("room_joined", {
          game,
        });
        return;
      }
      const userAddress = data.userAddress;
      if (!userAddress) return;
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
        let user = await User.findOne({ qortAddress: userAddress });
        if (!user) {
          user = new User({ qortAddress: userAddress });
          await user.save();
        }

        // Initialize GameState here if it doesn't exist
        if (!games[roomId]) {
          games[roomId] = new GameState(roomId);
        }
        // check to see if the game is already being played by two players
        const isGameFull = Object.keys(games[roomId].players)?.length > 1;
        if (isGameFull) {
          // check to see if the player is involved already in the game(reconnection)
          const isInvolved = games[roomId].players[userAddress];
          if (isInvolved) {
            games[roomId].addPlayer(userAddress, socket.id);
            socket.emit("room_joined", true);
            await socket.join(roomId);
            await new Promise((res) => {
              setInterval(() => {
                res();
              }, 750);
            });
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
            return;
          } else {
            //TODO: send back error that the user cannot join the game
            return;
          }
        } else {
          await socket.join(roomId);
          connectedUsers.set(userId, { socket, roomId, userAddress });
        }
        games[roomId].addPlayer(userAddress, socket.id, user._id.toHexString());
        socket.emit("room_joined", true);
        const players = games[roomId].getPlayers();

        setTimeout(async () => {
          io.in(roomId).emit("on_players_info", players);
          if (io.sockets.adapter.rooms.get(roomId)?.size === 2) {
            // Emit to the current socket/client that joined last
            const symbol = games[roomId].getSymbol(userAddress);
            socket.emit("start_game", {
              start: symbol === "x" ? true : false,
              symbol: symbol,
            });
            const symbolOther = games[roomId].getOtherPlayerSymbol(userAddress);

            // save beginning of game
            let game = await Game.findOne({ roomId });
            if (!game) {
              const mongoIds = games[roomId].getAllMongoIds();
              if (mongoIds.length !== 2) return;
              game = new Game({
                roomId,
                players: mongoIds.map((item) =>
                  mongoose.Types.ObjectId.createFromHexString(item)
                ), //
                status: "active", // Set the initial status to active
                series: {
                  totalGames: 3, // Set the series length to 3 games
                  scores: [
                    {
                      player: mongoose.Types.ObjectId.createFromHexString(
                        mongoIds[0]
                      ),
                      score: 0,
                    },
                    {
                      player: mongoose.Types.ObjectId.createFromHexString(
                        mongoIds[1]
                      ),
                      score: 0,
                    },
                  ],
                },
              });
              await game.save();
            }
            // Emit to all clients in the room, except the sender
            socket.to(roomId).emit("start_game", {
              start: symbolOther === "x" ? true : false,
              symbol: symbolOther,
            });

            const fullGame  = await getFullGame(roomId)
           
            io.in(roomId).emit("on_set_full_game_data", fullGame);
          }
        }, 1000);
      }
    } catch (error) {
      console.error(error);
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
      const gameRoom = getSocketGameRoom(socket);
      const { column, row, symbol } = data.matrix;
      const user = connectedUsers.get(socket.id);
      const roomId = user ? user.roomId : null;
      const userAddress = user ? user.userAddress : null;
      const {
        status,
        matrix: matrixRenamed,
        players,
      } = games[roomId].updateGameMatrix(column, row, userAddress);
      const matrix = structuredClone(matrixRenamed);

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
        const game = await Game.findOne({ roomId });
        game.history.push({
          state: matrix, // Final state of the current game
          tie: true, // was a tie?
        });

        // Check if a player has won the series
        const totalWinsRequired = Math.ceil(game.series.totalGames / 2); // At least half the total games
        const hasPlayerWonSeries = game.series.scores.some(
          (s) => s.score >= totalWinsRequired
        );
        if (hasPlayerWonSeries) {
          game.status = "finished";
          game.winner = game.series.scores.find(
            (s) => s.score >= totalWinsRequired
          ).player;
          games[roomId].setGameOver();
        }

        await game.save(); // Save the updated game document
        const fullGame  = await getFullGame(roomId)
        games[roomId].refreshGame();
        const newMatrix = games[roomId].getMatrix();
        io.to(currentTurnSocketId).emit("on_game_tie", {
          matrix: newMatrix,
          players,
          game: fullGame,
        });
        io.to(nonCurrentTurnSocketId).emit("on_game_tie", {
          matrix: newMatrix,
          players,
          game: fullGame,
        });
        games[roomId].changeWhoStarted();
        const newcurrentTurn = games[roomId].getCurrentTurnUserAddress();
        const newcurrentTurnSocketId =
          games[roomId].getSocketId(newcurrentTurn);
        const newnonCurrentTurnSocketId =
          games[roomId].getOtherPlayerSocketId(newcurrentTurn);
        io.to(newcurrentTurnSocketId).emit("on_turn_update", true);
        io.to(newnonCurrentTurnSocketId).emit("on_turn_update", false);
      } else if (status === "win") {
        const winner = games[roomId].getWinner();
        const winnerMongoObjectId = mongoose.Types.ObjectId.createFromHexString(
          winner.mongoId
        );
        const game = await Game.findOne({ roomId });

        // Update the winner's score in the series
        const scoreEntry = game.series.scores.find((s) =>
          s.player.equals(winnerMongoObjectId)
        );
        if (scoreEntry) {
          scoreEntry.score += 1;
        }

        // Append the game to the history
        game.history.push({
          state: matrix, // Final state of the current game
          winner: winnerMongoObjectId, // Game winner
        });

        // Check if a player has won the series
        // Check if a player has won the series
        const totalWinsRequired = Math.ceil(game.series.totalGames / 2); // At least half the total games
        const hasPlayerWonSeries = game.series.scores.some(
          (s) => s.score >= totalWinsRequired
        );
        if (hasPlayerWonSeries) {
          game.status = "finished";
          game.winner = game.series.scores.find(
            (s) => s.score >= totalWinsRequired
          ).player;
          games[roomId].setGameOver();
        }

        await game.save(); // Save the updated game document
        const fullGame  = await getFullGame(roomId)

        games[roomId].refreshGame();
        const newMatrix = games[roomId].getMatrix();
        io.to(currentTurnSocketId).emit("on_game_win", {
          matrix: newMatrix,
          players,
          game: fullGame,
        });
        io.to(nonCurrentTurnSocketId).emit("on_game_win", {
          matrix: newMatrix,
          players,
          game: fullGame,
        });
        games[roomId].changeWhoStarted();
        const newcurrentTurn = games[roomId].getCurrentTurnUserAddress();
        const newcurrentTurnSocketId =
          games[roomId].getSocketId(newcurrentTurn);
        const newnonCurrentTurnSocketId =
          games[roomId].getOtherPlayerSocketId(newcurrentTurn);
        io.to(newcurrentTurnSocketId).emit("on_turn_update", true);
        io.to(newnonCurrentTurnSocketId).emit("on_turn_update", false);
      }
      if (status === "win" || status === "tie") {

        // end game ( later save to db )
        // delete games[roomId]
      }
    } catch (error) {
      console.error(error);
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
      waitingList = waitingList.filter(
        (item) => item.userAddress !== userAddress
      );
      if (roomId && userAddress && games[roomId]) {
        games[roomId].handleDisconnect(userAddress, () => handleWinner(roomId));

        // Optionally, notify the other player in the room about the disconnection
        //   socket.to(roomId).emit("player_disconnected", { userAddress });
        const players = games[roomId].getPlayers();
        io.in(roomId).emit("on_players_info", players);
      }
      console.log(
        `User disconnected: ${userId}. Total users: ${connectedUsers.size}`
      );
    } catch (error) {
      console.error(error);
    }
  });
});

const PORT = process.env.PORT || 3001; // Fallback to 3001 if the PORT env variable is not set

server.listen(PORT, () => {
  console.log("server is running");
});
