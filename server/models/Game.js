const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  history: [{
    state: [[String]],  // 2D array representing the game's final state
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },  // Game winner
    startedAt: { type: Date, default: Date.now },
    tie: { type: Boolean, default: false },  // Indicates if the game ended in a tie

  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now },
  roomId: { type: Number, required: true, unique: true }, // Makes `roomId` a required field

  // New fields for series handling
  series: {
    totalGames: { type: Number, default: 3 }, // Default to a best-of-3 series
    scores: [{ player: mongoose.Schema.Types.ObjectId, score: Number }], // Track scores per player
  }
});

module.exports = Game = mongoose.model('Game', gameSchema);
