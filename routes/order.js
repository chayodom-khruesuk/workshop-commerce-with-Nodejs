var express = require('express');
var router = express.Router(); 
var productSchema = require('../model/product_model.js')
var userSchema = require('../model/user_model.js')
var orderSchema = require('../model/order_model.js')
var tokenMiddleware = require('../middleware/token_middleware.js')
const Counter = require('../model/counter_model');

router.get('/:id', async function(req, res, next) {
    try {
        let order = await orderSchema.findById(req.param.id);

        if (!order) {
            return res.status(404).send({
                data: null,
                message: "Order not found",
                successfully: false
            });
        }
        
        return res.status(200).send({
            data: order,
            message: "Get order by ID successfully",
            successfully: true
        });

    } catch (error) {
        return res.status(500).send({
            data: error,
            message: "Server error",
            successfully: false
        })
    }
});

router.get('/', async function(req, res, next) {
    try {
        let order = await orderSchema.find();
        return res.status(200).send({
            data: order,
            message: "Get all order successfully",
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
        let { username, products } = req.body;
        
        // Validate each product quantity
        for (let item of products) {
            if (!item.quantity || item.quantity < 1) {
                return res.status(400).send({
                    message: "Order quantity must be at least 1",
                    successfully: false
                });
            }
        }

        // Check if any order
        let orderCount = await orderSchema.countDocuments();
        if (orderCount === 0) {
            await Counter.findByIdAndUpdate(
                'orderId',
                { sequence_value: 0 },
                { new: true, upsert: true }
            );
        }

        let counter = await Counter.findByIdAndUpdate(
          'orderId',
          { $inc: { sequence_value: 1 } },
          { new: true, upsert: true }
        );
        let orderSeq = counter.sequence_value;
        let orderId = `ORD-${orderSeq}`;
        
        let user = await userSchema.findOne({username: username});
        if (!user) {
            return res.status(404).send({
                message: 'User not found',
                successfully: false
            });
        }

        let totalQuantity = 0;
        let orderProducts = [];
        let outStock = [];

        for (let item of products) {
            let product;

            if (item.productId) {
                product = await productSchema.findById(item.productId);
            } else {
                product = await productSchema.findOne({productName: item.productName});
            }
            
            if (!product) {
                return res.status(404).send({
                    message: 'Product not found',
                    successfully: false
                });
            }

            if (product.quantity < item.quantity) {
                outStock.push({
                    productName: product.productName,
                    orderQuantity: item.quantity,
                    availableStock: product.quantity
                });
            }

            orderProducts.push({
                productId: product._id,
                productName: product.productName,
                quantity: item.quantity,
                productPrice: product.productPrice
            });

            totalQuantity += product.productPrice * item.quantity;
        }
    
        if (outStock.length > 0) {
            return res.status(400).send({
                data: outStock,
                message: 'Out of stock',
                error: outStock
            });
        }

        let order = new orderSchema({
            orderId: orderId,

            username: username,
            products: orderProducts,
            totalQuantity: totalQuantity
        });

        let saveOrder = await order.save();
        
        for (let item of orderProducts) {
            await productSchema.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } }
            );
        }

        return res.status(201).send({
            data: saveOrder,
            message: 'Order created successfully',
            successfully: true
        });
        
    } catch (error) {
        return res.status(500).send({
            data: error,
            message: 'Server error',
            successfully: false
        });
    }
});

router.delete('/:id', tokenMiddleware, async function(req, res, next){
    try {
        let { id } = req.params;
        let order = await orderSchema.findOne({ orderId: id });
        if (!order){
            return res.status(404).send({
                data: order,
                message: 'Order not found',
                successfully: false
            });
        }

        // Return product back to stock
        for (let item of order.products){
            await productSchema.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: item.quantity } }
            );
        }

        await orderSchema.findOneAndDelete({ orderId: id });
        return res.status(200).send({
            message: 'Order deleted successfully',
            successfully: true
        });

    } catch (error) {
        return res.status(500).send({
            data: error,
            message: 'Server error',
            successfully: false
        });
    }
});

module.exports = router;
