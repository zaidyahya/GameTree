const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const messageSchema = new Schema({
    username: { type : String },
    userId: { type : String },
    content: { type : String },
}, {
    timestamps: true
})

const chatSchema = new Schema({
    lobbyId: { type: String },
    tournamentName: { type: String },
    messages: {
        type: [
            messageSchema
        ]
    }
}, {
    timestamps: true
})

const Chat = Model('Chat', chatSchema);

module.exports = { Chat };