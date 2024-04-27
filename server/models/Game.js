const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    state: [{ type: Number }],
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
    createdAt: { type: Date, default: Date.now }
  });
  
  const Game = mongoose.model('Game', gameSchema);
  