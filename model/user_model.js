const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: { type: String, unique: true },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {type: String, reequired: true},
    email: {type: String, required: true},
    age: {type: Number},
    gender: {type: String},
    role: {type: String},
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);
