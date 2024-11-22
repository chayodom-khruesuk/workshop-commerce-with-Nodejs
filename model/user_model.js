const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: { type: Number, unique: true },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {type: String, reequired: true},
    age: {type: Number},
    gender: {type: String}
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);
