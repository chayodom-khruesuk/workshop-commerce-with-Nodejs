var express = require('express');
var router = express.Router();
var productSchema = require('../model/product_model.js');
var tokenMiddleware = require('../middleware/token_middleware');
const Counter = require('../model/counter_model');

router.get('/:id', async function(req, res, next) {
    try {
        let productId = await productSchema.findById(req.params.id);
        
        if (!productId) {
            return res.status(404).send({
                data: null,
                message: "Product not found",
                successfully: false
            });
        }

        return res.status(200).send({
            data: productId,
            message: "Get product by ID successfully",
            successfully: true
        });

    } catch (error) {
        return res.status(500).send({
            data: error,
            message: "Server error",
            successfully: false
        });
    }
});

router.get('/', async function(req, res, next) {
    try {
        let product = await productSchema.find();
        return res.status(200).send({
            data: product,
            message: "Get all product successfully",
            successfully: true
        });
    } catch (error) {
        return res.status(500).send({
            data: error,
            message: "Server error",
            successfully: false
        });
    }
});

router.post('/', tokenMiddleware, async function(req, res, next){
    try {
        let { productName, productDescri, productPrice, quantity } = req.body

        if (quantity <= 0 || productPrice < 0) {
            return res.status(400).send({
                message: "Create product cannot be less than 1",
                successfully: false
            });
        }

        const counter = await Counter.findByIdAndUpdate(
          'productId',
          { $inc: { sequence_value: 1 } },
          { new: true, upsert: true }
        );
        const productId = counter.sequence_value;

        let newProduct = new productSchema({
            productId: productId,
            productName: productName,
            productDescri: productDescri,
            productPrice: productPrice,
            quantity: quantity
        });

        let product = await newProduct.save();
        return res.status(201).send({
            data: product,
            message: "Create product successfully",
            successfully: true
        });
    } catch (error) {
        return res.status(500).send({
            data: error,
            message: "Create product failed",
            successfully: false
        });
    }
});


router.put('/:id', tokenMiddleware, async function(req, res, next){
    try {
        let { productName, productDescri, productPrice, quantity } = req.body
        let { id } = req.params
        
        if (quantity <= 0 || productPrice < 0) {
                return res.status(400).send({
                    message: "Invalid quantity. Quantity cannot be less than 1",
                    successfully: false
                });
            }

        let productUpdate = await productSchema.findByIdAndUpdate(id, {
            productName: productName,
            productDescri: productDescri,
            productPrice: productPrice,
            quantity: quantity
        }, {new: true});

        return res.status(200).send({
            data: productUpdate,
            message: "Update product successfully",
            successfully: true
        });

    } catch (error) {
        return res.status(500).send({
            data: error,
            message: "Update product failed",
            successfully: false
        });
    }
});

router.delete('/:id', tokenMiddleware, async function(req, res, next){
    try {
        let { id } =  req.params
        let product = await productSchema.findByIdAndDelete(id);
        return res.status(200).send({
            data: product,
            message: "Delete product successfully",
            successfully: true  
        });
    } catch (error) {
        return res.status(500).send({
            data: error,
            message: "Delete product failed",
            successfully: false
        })
    }
});

module.exports = router;
