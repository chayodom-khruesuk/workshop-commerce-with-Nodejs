const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    orderId: {type: String, unique: true},
    username: {type: String, required: true},
    products: [{
        productId: {type: Schema.Types.ObjectId, ref: 'Product'},
        productName: {type: String},
        quantity: {type: Number},
        productPrice: {type: Number},
        mainImage: {type: String}
    }],
    totalAmount: {type: Number, required: true},
    orderDate: {type: Date, default: Date.now}
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);
