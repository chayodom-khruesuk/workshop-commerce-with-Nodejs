const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: { type: String,  unique: true },
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
