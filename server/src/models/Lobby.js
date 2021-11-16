const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const lobbySchema = new Schema({
    name: String,
    size: Number,
    hostId: String,
    players: [{
        username: String,
        userId: String,
        ranking: String,
        level: String,
        _id: false
    }],
    isActive: { type: Boolean, default: false },
    isGameStarted: { type: Boolean, default: false }
}, {
    timestamps: true
})

const Lobby = Model('Lobby', lobbySchema);

module.exports = Lobby;