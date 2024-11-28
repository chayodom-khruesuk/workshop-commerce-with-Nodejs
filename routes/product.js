const express = require('express')
const router = express.Router()
const Product = require('../model/product_model.js')
const tokenMiddleware = require('../middleware/token_middleware')
const Counter = require('../model/counter_model')

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        data: null,
        message: 'Product not found',
        success: false
      })
    }

    return res.status(200).json({
      data: product,
      message: 'Get product by ID successfully',
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

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    return res.status(200).json({
      data: products,
      message: 'Get all products successfully',
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

// Create new product
router.post('/', tokenMiddleware, async (req, res) => {
  try {
    const {
      productName,
      productDescri,
      shortDescription,
      productPrice,
      // category,
      mainImage,
      galleryImages,
      specifications,
      quantity
    } = req.body

    if (!isValidProduct(productPrice, quantity)) {
      return res.status(400).json({
        message: 'Invalid price or quantity values',
        success: false
      })
    }

    const existingProduct = await Product.findOne({ 
      $or: [
        { productName },
      ]
    })
    
    if (existingProduct) {
      return res.status(400).json({
        message: 'Product name or SKU already exists',
        success: false
      })
    }

    const productId = await generateProductId()
    const newProduct = new Product({
      productId,
      productName,
      productDescri,
      shortDescription,
      productPrice,
      // category,
      mainImage,
      galleryImages,
      specifications,
      quantity
    })

    const savedProduct = await newProduct.save()
    return res.status(201).json({
      data: savedProduct,
      message: 'Create product successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Create product failed',
      success: false
    })
  }
})

// Update Product
router.put('/update/:id', tokenMiddleware, async (req, res) => {
  try {
    const {
      productName,
      productDescri,
      shortDescription,
      productPrice,
      // category,
      mainImage,
      galleryImages,
      specifications,
      quantity
    } = req.body
    const { id } = req.params

    if (!isValidProduct(productPrice, quantity)) {
      return res.status(400).json({
        message: 'Invalid price or quantity values',
        success: false
      })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName,
        productDescri,
        shortDescription,
        productPrice,
        // category,
        mainImage,
        galleryImages,
        specifications,
        quantity
      },
      { new: true }
    )

    return res.status(200).json({
      data: updatedProduct,
      message: 'Update product successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Update product failed',
      success: false
    })
  }
})

// Delete product
router.delete('/:id', tokenMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const deletedProduct = await Product.findByIdAndDelete(id)
    
    return res.status(200).json({
      data: deletedProduct,
      message: 'Delete product successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({
      data: error,
      message: 'Delete product failed',
      success: false
    })
  }
})

// Helper functions
async function generateProductId() {
  const productCount = await Product.countDocuments()
  
  if (productCount === 0) {
    await Counter.findByIdAndUpdate(
      'productId',
      { sequence_value: 0 },
      { new: true, upsert: true }
    )
  }

  const counter = await Counter.findByIdAndUpdate(
    'productId',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  )
  
  return `PROD${counter.sequence_value}`
}

function isValidProduct(price, quantity) {
  return quantity > 0 && price >= 0
}

module.exports = router
