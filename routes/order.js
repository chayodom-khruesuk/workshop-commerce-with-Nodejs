const express = require('express')
const router = express.Router()
const Product = require('../model/product_model.js')
const User = require('../model/user_model.js')
const Order = require('../model/order_model.js')
const tokenMiddleware = require('../middleware/token_middleware.js')
const Counter = require('../model/counter_model')

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.param.id)
    
    if (!order) {
      return res.status(404).json({
        data: null,
        message: 'Order not found',
        success: true
      })
    }
    
    return res.status(200).json({
      data: order,
      message: 'Get order by ID successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Server error',
      success: false
    })
  }
})

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
    return res.status(200).json({
      data: orders,
      message: 'Get all orders successfully', 
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Server error',
      success: false
    })
  }
})

// Create new order
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Match the exact structure from Carts.vue
    const items = req.body;
    const orderId = await generateOrderId();

    // Calculate total from items directly
    const totalAmount = items.products.reduce((total, item) => {
      return total + (item.productPrice * item.quantity);
    }, 0);

    const order = new Order({
      orderId,
      username: items.username,
      products: items.products,
      totalAmount
    });

    const savedOrder = await order.save();

    return res.status(201).json({
      data: savedOrder,
      message: 'Order created successfully',
      success: true
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      data: error,
      message: 'Server error',
      success: false
    });
  }
});





// Delete order
router.delete('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const order = await Order.findOne({ orderId: id })

    if (!order) {
      return res.status(404).json({
        data: order,
        message: 'Order not found',
        success: false
      })
    }

    await restoreProductStock(order.products)
    await Order.findOneAndDelete({ orderId: id })

    return res.status(200).json({
      message: 'Order deleted successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Server error',
      success: false
    })
  }
})

// Helper functions
async function generateOrderId() {
  const orderCount = await Order.countDocuments()
  
  if (orderCount === 0) {
    await Counter.findByIdAndUpdate(
      'orderId',
      { sequence_value: 0 },
      { new: true, upsert: true }
    )
  }

  const counter = await Counter.findByIdAndUpdate(
    'orderId',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
  
  return `ORD-${counter.sequence_value}`
}

function validateProdผผผผผผผผผผucts(products) {
  return products.every(item => item.quantity && item.quantity >= 1)
}

async function processOrderProducts(products) {
  const orderProducts = []
  const outOfStock = []
  let totalQuantity = 0

  for (const item of products) {
    const product = item.productId 
      ? await Product.findById(item.productId)
      : await Product.findOne({ productName: item.productName })

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.quantity < item.quantity) {
      outOfStock.push({
        productName: product.productName,
        orderQuantity: item.quantity,
        availableStock: product.quantity
      })
    }

    orderProducts.push({
      productId: product._id,
      productName: product.productName,
      quantity: item.quantity,
      productPrice: product.productPrice
    })

    totalQuantity += product.productPrice * item.quantity
  }

  return { orderProducts, totalQuantity, outOfStock }
}

async function updateProductStock(orderProducts) {
  for (const item of orderProducts) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { quantity: -item.quantity } }
    )
  }
}

async function restoreProductStock(products) {
  for (const item of products) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { quantity: item.quantity } }
    )
  }
}

module.exports = router
