const express = require('express');
const router = express.Router();
const Category = require('../model/category_model');
const tokenMiddleware = require('../middleware/token_middleware');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({ active: true });
        res.status(200).json({
            data: categories,
            message: 'Get categories successfully',
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to get categories',
            success: false
        });
    }
});

// Create category (admin only)
router.post('/', async (req, res) => {
    try {
        const { name} = req.body;
        const slug = name.toLowerCase().replace(/\s+/g, '-');

        const newCategory = new Category({
            name,
            slug
        });

        const savedCategory = await newCategory.save();
        res.status(201).json({
            data: savedCategory,
            message: 'Category created successfully',
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to create category',
            success: false
        });
    }
});

module.exports = router;
