const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    qortAddress: { type: String, required: true, unique: true },
    totalWins: { type: Number, default: 0 }
  });
  
module.exports = User = mongoose.model('User', userSchema);
  