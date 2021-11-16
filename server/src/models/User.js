const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.model;

const userSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    password: { type: String },
    points: { type: Number, default: 0 },
    ranking: { type: Number },
    level: { type: String, enum: ['Amateur', 'Professional', 'Expert'], default: 'Amateur' },
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    adminTourShown: { type: Boolean, default: false }
}, {
    timestamps: true
})

userSchema.methods.matchesPassword = function(password) {
    return password == this.password 
}

// Helper function that reduces the amount of JSON that is returned on the document
userSchema.set('toJSON', {
    transform: (doc, { __v, password, ...rest }, options) => rest
})

const User = Model('User', userSchema);

module.exports = User;

