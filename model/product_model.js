const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    productId: { type: String, unique: true },
    productName: { type: String, unique: true, required: true },
    productDescri: { type: String, required: true },
    shortDescription: { type: String },
    productPrice: { type: Number, required: true },
    // category: { type: String },
    mainImage: { type: String },
    galleryImages: [{ type: String }],
    specifications: [{
        name: { type: String },
        value: { type: String }
    }],
    quantity: { type: Number, required: true, default: 0 }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema);
