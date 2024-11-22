const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    productId: { type: String, unique: true },
    productName: {type: String, unique : true},
    productDescri: {type: String},
    productPrice: {type: Number},
    quantity: {type: Number},
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema);
