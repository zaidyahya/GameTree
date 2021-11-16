const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const disputeSchema = new Schema({
    value: { type: Number },
    playerId: { type: String },
    playerName: { type: String },
    matchId: { type: String },
    playerNumber: { type: String }, //playerOne or playerTwo in the Match
    roundName: { type: String },
    side: { type: String }, //Which side of the tournament tree
    tournamentId: { type: String },
    isResolved: { type: Boolean, default: false }
})

const playerSchema = new Schema({
    username: { type: String, default: "Jane Doe" },
    userId: { type: String, default: "222111" },
    score: { type: Number, default: 0 },
    disputesLeft: { type: Number, default: -1 },
    isEliminated: { type: Boolean, default: false }
})

const matchSchema = new Schema({
    playerOne: {
        type: playerSchema
    },
    playerTwo: {
        type: playerSchema
    },
    winner: { type: String, default: null },
    isFinished: { type: Boolean, default: false }
})

const tournamentSchema = new Schema({
    size: { type: Number },
    name: { type: String },
    hostSocket: { type: String },
    hostId: { type: String },
    lobbyId: { type: String },
    isCompleted: { type: Boolean, default: false },
    disputes: [ disputeSchema ],
    leftDraw: {
        r32: {
            type: [
                matchSchema
            ]
        },
        rSixteen: {
            type: [
                matchSchema
            ]
        },
        quarters: {
            type: [
                matchSchema
            ]
        },
        semis: {
            type: [
                matchSchema
            ]
        }
    },
    rightDraw: {
        r32: {
            type: [
                matchSchema
            ]
        },
        rSixteen: {
            type: [
                matchSchema
            ]
        },
        quarters: {
            type: [
                matchSchema
            ]
        },
        semis: {
            type: [
                matchSchema
            ]
        }
    },
    final: matchSchema
}, {
    timestamps: true
})

const Tournament = Model('Tournament', tournamentSchema);
const Match = Model('Match', matchSchema);
const Dispute = Model('Dispute', disputeSchema);

module.exports = { Tournament, Match, Dispute };